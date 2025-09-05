'use client';
import React, { useState } from 'react';
import { Topic, Subtopic } from '../../lib/types';
import { sampleTopics } from '../../lib/data/topics';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface TopicSelectionViewProps {
  onStartSession: (selectedSubtopics: Subtopic[]) => void;
}

export function TopicSelectionView({ onStartSession }: TopicSelectionViewProps) {
  const [selectedSubtopics, setSelectedSubtopics] = useState<Subtopic[]>([]);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const handleSubtopicSelect = (subtopic: Subtopic, topicName: string) => {
    const subtopicWithTopic = { ...subtopic, topicName };
    
    setSelectedSubtopics(prev => {
      const isSelected = prev.some(s => 
        s.subtopicName === subtopic.subtopicName && 
        s.topicName === topicName
      );
      
      if (isSelected) {
        return prev.filter(s => 
          !(s.subtopicName === subtopic.subtopicName && s.topicName === topicName)
        );
      } else {
        return [...prev, subtopicWithTopic];
      }
    });
  };

  const handleStartSession = (topicName: string) => {
    const topicSubtopics = selectedSubtopics.filter(s => s.topicName === topicName);
    onStartSession(topicSubtopics);
  };

  const isSubtopicSelected = (subtopic: Subtopic, topicName: string) => {
    return selectedSubtopics.some(s => 
      s.subtopicName === subtopic.subtopicName && s.topicName === topicName
    );
  };

  const getSelectedSubtopicsForTopic = (topicName: string) => {
    return selectedSubtopics.filter(s => s.topicName === topicName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">A-Level Mathematics</h1>
        <p className="text-gray-600">Select topics to work on in your session</p>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        {sampleTopics.map((topic) => {
          const selectedCount = getSelectedSubtopicsForTopic(topic.topicName).length;
          const hasSelectedSubtopics = selectedCount > 0;
          
          return (
            <div key={topic.topicName} className="relative">
              <Card 
                className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg min-h-[300px] flex flex-col justify-center ${
                  hoveredTopic === topic.topicName 
                    ? 'bg-blue-100 shadow-md' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredTopic(topic.topicName)}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {topic.topicName}
                  </h3>
                  <p className="text-base text-gray-600">
                    {topic.subTopics.length} subtopics available
                  </p>
                  <p className="text-base text-red-800">
                    {topic.subTopics[1].subtopicName} check it out bruh    
                  </p>
                </div>
              </Card>

              {/* Hover Table - Fixed hover behavior */}
              {hoveredTopic === topic.topicName && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 z-10"
                  onMouseEnter={() => setHoveredTopic(topic.topicName)}
                  onMouseLeave={() => setHoveredTopic(null)}
                >
                  <Card className="p-8 shadow-xl border-2">
                    <h4 className="font-semibold text-center">{topic.topicName} - Subtopics</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subtopic</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topic.subTopics.map((subtopic) => (
                          <TableRow 
                            key={subtopic.subtopicName}
                            className={`cursor-pointer ${
                              isSubtopicSelected(subtopic, topic.topicName)
                                ? 'bg-blue-100 border-gray-600 hover:bg-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSubtopicSelect(subtopic, topic.topicName)}
                          >
                            <TableCell className="font-medium">
                              {subtopic.subtopicName}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1.5 rounded-full text-m font-small ${
                                subtopic.subtopicStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : subtopic.subtopicStatus === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {subtopic.subtopicStatus.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {subtopic.subtopicEstimatedGrade}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Start Session Button for this topic */}
                    <div className="mt-0 pt-4 border-t flex justify-between items-center">
                      <div className="text-sm text-gray-600 text-right">
                        {selectedCount} of {topic.subTopics.length} subtopic(s) selected
                      </div>
                      <Button 
                        onClick={() => handleStartSession(topic.topicName)}
                        disabled={!hasSelectedSubtopics}
                        size="default"
                        className={`${
                          hasSelectedSubtopics 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Start
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
