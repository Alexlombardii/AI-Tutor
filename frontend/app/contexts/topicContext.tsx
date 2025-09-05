import { createContext, useContext } from 'react'
import { Subtopic } from '../lib/types'



export interface TopicContext{
    selectedSubtopics: Subtopic[];
    selectSubtopic: (subtopic: Subtopic) => void;
    deselectSubtopic: (subtopic: Subtopic) => void;
    }
