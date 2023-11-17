import { Action } from "..//state/types";

export const CourseIdeas: Action = {
  name: "courseIdeas",
  inputs: [
    {
      type: "text",
      id: "subjectArea",
      label: "Subject Area",
      placeholder: "Enter the subject area for the course",
      required: true,
    },
    {
      type: "textArea",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe your target audience",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a list of course ideas for the subject area '${payload.subjectArea}' targeting the audience '${payload.targetAudience}'. Consider the audience's needs, interests, and potential challenges they might face in this subject area.`,
};

export const CourseTitle: Action = {
  name: "courseTitle",
  inputs: [
    {
      type: "text",
      id: "courseDescription",
      label: "Course Description",
      placeholder: "Describe your course",
      required: true,
    },
    {
      type: "textArea",
      id: "courseObjectives",
      label: "Course Objectives",
      placeholder: "What will students achieve by the end of this course?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a catchy and descriptive title for a course about '${payload.courseDescription}', which includes the following key details: '${payload.courseObjectives}'.`,
  tone: true,
};

export const CourseDescription: Action = {
  name: "courseDescription",
  inputs: [
    {
      type: "text",
      id: "courseDescription",
      label: "Course Description",
      placeholder: "Describe your course",
      required: true,
    },
    {
      type: "textArea",
      id: "courseObjectives",
      label: "Course Objectives",
      placeholder: "What will students achieve by the end of this course?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a compelling and engaging course description for a course that covers the following topics: '${payload.courseDescription}', and aims to achieve these objectives: '${payload.courseObjectives}'.`,
  tone: true,
};

export const OutlineGenerator: Action = {
  name: "outlineGenerator",
  inputs: [
    {
      type: "text",
      id: "courseDescription",
      label: "Course Description",
      placeholder: "Describe your course",
      required: true,
    },
    {
      type: "textArea",
      id: "courseObjectives",
      label: "Course Objectives",
      placeholder: "What will students achieve by the end of this course?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Please develop a high-level structure for a course with the following description: '${payload.courseDescription}', and these objectives: '${payload.courseObjectives}'. The structure should outline the main categories or modules to be covered in the course. Course Outline: `,
  tone: true,
};

export const LessonPlan: Action = {
  name: "lessonPlan",
  inputs: [
    {
      type: "text",
      id: "moduleName",
      label: "Module Name",
      placeholder: "Name of the module",
      required: true,
    },
    {
      type: "textArea",
      id: "moduleSubtopics",
      label: "Module Subtopics",
      placeholder: "List the subtopics covered in this module",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `return a list of lessons for the module named '${payload.moduleName}', which covers the following subtopics: '${payload.moduleSubtopics}'. Each subtopic should be covered in one or more lessons, and the lessons should be ordered in a logical sequence.`,
};

export const VideoScript: Action = {
  name: "videoScript",
  inputs: [
    {
      type: "text",
      id: "lessonName",
      label: "Lesson Name",
      placeholder: "Name of the lesson",
      required: true,
    },
    {
      type: "textArea",
      id: "lessonObjectives",
      label: "Lesson Objectives",
      placeholder: "What will students learn in this lesson?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a script for a video lesson named '${payload.lessonName}', which aims to achieve the following objectives: '${payload.lessonObjectives}'. The script should provide a clear and engaging explanation of the lesson content, with pauses for demonstrations or activities as needed.`,
  tone: true,
};

export const LessonContent: Action = {
  name: "lessonContent",
  inputs: [
    {
      type: "text",
      id: "lessonName",
      label: "Lesson Name",
      placeholder: "Name of the lesson",
      required: true,
    },
    {
      type: "textArea",
      id: "lessonObjectives",
      label: "Lesson Objectives",
      placeholder: "What will students learn in this lesson?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate text content for a lesson named '${payload.lessonName}', which aims to achieve the following objectives: '${payload.lessonObjectives}'. The content should provide a clear and engaging explanation of the lesson material, with examples or activities as needed.`,
  tone: true,
};

export const ModuleQuiz: Action = {
  name: "quizGenerator",
  inputs: [
    {
      type: "text",
      id: "moduleName",
      label: "Module Name",
      placeholder: "Name of the module",
      required: true,
    },
    {
      type: "textArea",
      id: "moduleSubtopics",
      label: "Module Subtopics",
      placeholder: "List the subtopics covered in this module",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a quiz to assess student understanding of the module named '${payload.moduleName}', which covers the following topics: '${payload.moduleSubtopics}'. The quiz should include a variety of question types (e.g., multiple choice, true/false, etc.) and cover all the main topics of the module.`,
  tone: true,
};

export const CourseGuide: Action = {
  name: "courseGuide",
  inputs: [
    {
      type: "text",
      id: "courseDescription",
      label: "Course Description",
      placeholder: "Describe your course",
      required: true,
    },
    {
      type: "textArea",
      id: "courseObjectives",
      label: "Course Objectives",
      placeholder: "What will students achieve by the end of this course?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create a structured PDF guide template for a course titled '${payload.courseDescription}'. The guide should follow this format:

    1. Introduction: A brief overview of the course and its objectives.
    2. Course Objectives: A detailed list of the course objectives - '${payload.courseObjectives}'.
    3. Course Content: A comprehensive breakdown of the course content, including key topics and subtopics.
    4. Conclusion: A summary of the course and its key takeaways.

    Please fill in each section with appropriate content.`,
  tone: true,
};

const ACTIONS = {
  courseIdeas: CourseIdeas,
  courseTitle: CourseTitle,
  courseDescription: CourseDescription,
  outlineGenerator: OutlineGenerator,
  lessonPlan: LessonPlan,
  lessonContent: LessonContent,
  videoScript: VideoScript,
  moduleQuiz: ModuleQuiz,
  courseGuide: CourseGuide,
};

export default ACTIONS;
