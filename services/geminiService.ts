import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, Grade, Question, QuestionType } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Schema for Question Generation
const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          type: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.FILL_IN_BLANK] },
          content: { type: Type.STRING, description: "The question text" },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 options if multiple choice, empty if fill in blank"
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["id", "type", "content", "correctAnswer"]
      }
    }
  }
};

// Schema for Grading
const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Total score from 0 to 10" },
    feedback: { type: Type.STRING, description: "Encouraging feedback for the student" },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.INTEGER },
          isCorrect: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING }
        }
      }
    }
  }
};

export const generateDailyQuestions = async (subject: Subject, grade: Grade): Promise<Question[]> => {
  const ai = getClient();
  
  const prompt = `
    Role: Primary School Teacher.
    Task: Create 10 practice questions for a ${grade} student in the subject of ${subject}.
    
    Requirements:
    1. Questions should be appropriate for the grade level complexity.
    2. For ${Subject.MATH}, ensure numbers are solvable mentally or with scratch paper suitable for the grade.
    3. For ${Subject.ENGLISH}, focus on vocabulary, simple grammar, or reading comprehension suitable for the grade.
    4. For ${Subject.CHINESE}, focus on Pinyin, poetry, characters, or simple reading comprehension.
    5. Mix of Multiple Choice (A,B,C,D) and Short Answer (Fill in blank).
    6. Return exactly 10 questions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
        temperature: 0.7
      }
    });

    const result = JSON.parse(response.text || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Return simplified fallback or re-throw
    throw new Error("AI服务暂时不可用，请稍后再试。");
  }
};

export const gradeQuizSubmission = async (
  questions: Question[],
  userAnswers: string[],
  subject: Subject
): Promise<{ score: number; feedback: string; corrections: any[] }> => {
  const ai = getClient();

  const submissionData = questions.map((q, index) => ({
    question: q.content,
    correctAnswer: q.correctAnswer,
    userAnswer: userAnswers[index] || "(No Answer)"
  }));

  const prompt = `
    Role: Kind Primary School Teacher.
    Task: Grade this ${subject} quiz submission.
    Data: ${JSON.stringify(submissionData)}
    
    Requirements:
    1. Calculate score based on 1 point per correct answer (Total 10).
    2. Provide warm, encouraging feedback appropriate for a child.
    3. Explain mistakes simply.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: gradingSchema
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Grading failed:", error);
    return {
      score: 0,
      feedback: "系统判分出错，请检查网络。",
      corrections: []
    };
  }
};