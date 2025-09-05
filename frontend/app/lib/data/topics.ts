import { Topic } from '../types';

export const sampleTopics: Topic[] = [
  {
    topicName: "Differentiation",
    subTopics: [
      {
        subtopicName: "Basic Differentiation",
        subtopicStatus: "not_started",
        subtopicEstimatedGrade: "B",
        topicName: "Differentiation"
      },
      {
        subtopicName: "Product Rule",
        subtopicStatus: "not_started", 
        subtopicEstimatedGrade: "C",
        topicName: "Differentiation"
      },
      {
        subtopicName: "Chain Rule",
        subtopicStatus: "in_progress",
        subtopicEstimatedGrade: "A",
        topicName: "Differentiation"
      }
    ]
  },
  {
    topicName: "Integration",
    subTopics: [
      {
        subtopicName: "Basic Integration",
        subtopicStatus: "completed",
        subtopicEstimatedGrade: "A*",
        topicName: "Integration"
      },
      {
        subtopicName: "Integration by Parts",
        subtopicStatus: "not_started",
        subtopicEstimatedGrade: "B",
        topicName: "Integration"
      }
    ]
  },
  {
    topicName: "Logarithms",
    subTopics: [
      {
        subtopicName: "Basic Logarithms",
        subtopicStatus: "not_started",
        subtopicEstimatedGrade: "C",
        topicName: "Logarithms"
      },
      {
        subtopicName: "Logarithmic Equations",
        subtopicStatus: "not_started",
        subtopicEstimatedGrade: "D",
        topicName: "Logarithms"
      }
    ]
  }
];
