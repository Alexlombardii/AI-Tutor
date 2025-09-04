import { RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC } from '@openai/agents/realtime';
import { useState, useRef, useCallback, useEffect } from 'react';
import { SessionStatus } from '../lib/types';
import { useTranscript } from '../contexts/transcriptContext';
import { useHandleSessionHistory } from './useHandleSessionHistory';

export interface RealtimeSessionCallbacks{
  onConnectionChange?: (status: SessionStatus) => void
} 

export interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgents: RealtimeAgent[];
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
  outputGuardrails?: any[];
}

export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<
    SessionStatus
  >('DISCONNECTED');

  const { addTranscriptBreadcrumb, addHighSignalSlate } = useTranscript(); 

  const updateStatus = useCallback(
    (s: SessionStatus) => {
      setStatus(s);
      callbacks.onConnectionChange?.(s);
    },
    [callbacks],
  );

  const historyHandlers = useHandleSessionHistory().current;

  function handleTransportEvent(event: any) {
    // Handle additional server events that aren't managed by the session
    switch (event.type) {
      case "conversation.item.input_audio_transcription.completed": {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case "response.audio_transcript.done": {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case "response.audio_transcript.delta": {
        historyHandlers.handleTranscriptionDelta(event);
        break;
      }
      case "conversation.item.created": {
        if (event.item?.type === 'message') {
          historyHandlers.handleHistoryAdded(event.item);
        }
        break;
      }
      case "response.done": {
        // Handle when assistant response is complete
        if (event.response?.output) {
          event.response.output.forEach((item: any) => {
            if (item.type === 'message') {
              historyHandlers.handleHistoryAdded(item);
            }
          });
        }
        break;
      }
      case "workings.scan.result": {
        historyHandlers.handleWorkingsScan(
          event.practice_question_id,      // the slate ID
          event.payload.worked_example,    // the JSON from backend vision llm
          "user"                           // role of sender
        );
        break;
      }
    }
  }


  useEffect(() => {
    if (sessionRef.current) {

      // history events
      sessionRef.current.on("agent_tool_start", historyHandlers.handleAgentToolStart);
      sessionRef.current.on("agent_tool_end", historyHandlers.handleAgentToolEnd);
      sessionRef.current.on("history_updated", historyHandlers.handleHistoryUpdated);
      sessionRef.current.on("history_added", historyHandlers.handleHistoryAdded);

      // additional transport events
      sessionRef.current.on("transport_event", handleTransportEvent);
    }
  }, [sessionRef.current]);

  const connect = useCallback(
    async ({
      getEphemeralKey,
      initialAgents,
      audioElement,
      extraContext,
      outputGuardrails,
    }: ConnectOptions) => {
      if (sessionRef.current) return; 

      updateStatus('CONNECTING');

      const ek = await getEphemeralKey();
      const rootAgent = initialAgents[0];


      sessionRef.current = new RealtimeSession(rootAgent, {
        transport: new OpenAIRealtimeWebRTC({
          audioElement,
        }),
        model: 'gpt-4o-realtime-preview-2025-06-03',
        config: {
          inputAudioFormat: 'pcm16',
          outputAudioFormat: 'pcm16',
          inputAudioTranscription: {
            model: 'gpt-4o-mini-transcribe',
          },
        },
        outputGuardrails: outputGuardrails ?? [],
        context: {
          ...extraContext,
          addTranscriptBreadcrumb,   
          addHighSignalSlate,        
        },
      });

      await sessionRef.current.connect({ apiKey: ek });
      updateStatus('CONNECTED');
    },
    [callbacks, updateStatus, addTranscriptBreadcrumb, addHighSignalSlate],
  );

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    updateStatus('DISCONNECTED');
  }, [updateStatus]);

  const sendMessageToRealtime = useCallback((message: string) => {
    if (sessionRef.current) {
      sessionRef.current.sendMessage({type: "message", role: "user", content: [{ type: "input_text", text: message }]});
    }
  }, []);

  return { status, connect, disconnect, sendMessageToRealtime };
}

