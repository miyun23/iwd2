import { type Student, type InsertStudent, type Subject, type InsertSubject, type StudentWithSubjects, type DashboardMetrics, type PerformanceData } from "@shared/schema";
import { randomUUID } from "crypto";
import { parseStudentCSV } from "./csv-parser";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<StudentWithSubjects | undefined>;
  getStudentByEmail(email: string): Promise<StudentWithSubjects | undefined>;
  createStudent(student: InsertStudent): Promise<StudentWithSubjects>;
  getAllStudents(): Promise<StudentWithSubjects[]>;
  getStudentsBySemester(semester: string): Promise<StudentWithSubjects[]>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<StudentWithSubjects | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  // Subject operations
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubjectsByStudentId(studentId: string): Promise<Subject[]>;

  // Analytics operations
  getDashboardMetrics(semester?: string): Promise<DashboardMetrics>;
  getDashboardPerformance(semester?: string): Promise<PerformanceData>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private subjects: Map<string, Subject>;

  constructor() {
    this.students = new Map();
    this.subjects = new Map();
    this.seedData();
  }

  private seedData() {
    try {
      // Parse CSV data and load into storage
      const { students, subjects } = parseStudentCSV();
      
      // Load students
      students.forEach(student => {
        this.students.set(student.id, {
          ...student,
          credits: student.credits || 0,
          subjects: student.subjects || [],
          createdAt: new Date().toISOString()
        });
      });

      // Load subjects
      subjects.forEach(subject => {
        const id = randomUUID();
        this.subjects.set(id, {
          id,
          code: subject.code,
          name: subject.name,
          grade: subject.grade,
          status: subject.status,
          studentId: subject.studentId
        });
      });

      console.log(`Loaded ${students.length} students and ${subjects.length} subjects from CSV`);
    } catch (error) {
      console.error('Error loading CSV data, using fallback data:', error);
      
      // Fallback data if CSV parsing fails
      const sampleStudents: InsertStudent[] = [
        {
          id: 'A0001',
          name: 'Anya Taylor-Joy',
          email: 'A0001@uow.edu.my',
          intake: 'Jun-25',
          programme: 'Bachelor of Information Systems (Hons)',
          cgpa: '3.50',
          credits: 18
        },
        {
          id: 'A0002',
          name: 'Austin Butler',
          email: 'A0002@uow.edu.my',
          intake: 'Jun-25',
          programme: 'Bachelor of Information Systems (Hons)',
          cgpa: '2.80',
          credits: 15
        }
      ];

      sampleStudents.forEach(student => {
        this.students.set(student.id, {
          ...student,
          credits: student.credits || 0,
          subjects: student.subjects || [],
          createdAt: new Date().toISOString()
        });
      });
    }
  }

  async getStudent(id: string): Promise<StudentWithSubjects | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const subjects = await this.getSubjectsByStudentId(id);
    return { ...student, subjects };
  }

  async getStudentByEmail(email: string): Promise<StudentWithSubjects | undefined> {
    const student = Array.from(this.students.values()).find(s => s.email === email);
    if (!student) return undefined;

    const subjects = await this.getSubjectsByStudentId(student.id);
    return { ...student, subjects };
  }

  async createStudent(insertStudent: InsertStudent): Promise<StudentWithSubjects> {
    const student: Student = {
      ...insertStudent,
      credits: insertStudent.credits || 0,
      subjects: insertStudent.subjects || [],
      createdAt: new Date().toISOString()
    };
    this.students.set(student.id, student);
    return { ...student, subjects: [] };
  }

  async getAllStudents(): Promise<StudentWithSubjects[]> {
    const students = Array.from(this.students.values());
    const studentsWithSubjects = await Promise.all(
      students.map(async student => {
        const subjects = await this.getSubjectsByStudentId(student.id);
        return { ...student, subjects };
      })
    );
    return studentsWithSubjects;
  }

  async getStudentsBySemester(semester: string): Promise<StudentWithSubjects[]> {
    const allStudents = await this.getAllStudents();
    return allStudents.filter(student => student.intake === semester);
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<StudentWithSubjects | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;

    const updatedStudent = { ...existingStudent, ...updateData };
    this.students.set(id, updatedStudent);
    
    const subjects = await this.getSubjectsByStudentId(id);
    return { ...updatedStudent, subjects };
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const newSubject: Subject = { 
      ...subject, 
      id,
      grade: subject.grade || null,
      studentId: subject.studentId || null
    };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async getSubjectsByStudentId(studentId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(subject => subject.studentId === studentId);
  }

  async getDashboardMetrics(semester?: string): Promise<DashboardMetrics> {
    let students: StudentWithSubjects[];
    
    if (semester && semester !== 'all') {
      students = await this.getStudentsBySemester(semester);
    } else {
      students = await this.getAllStudents();
    }

    const totalStudents = students.length;
    const deansListCount = students.filter(s => parseFloat(s.cgpa) >= 3.75 && s.credits >= 12).length;
    const probationCount = students.filter(s => parseFloat(s.cgpa) < 2.00).length;
    const averageCGPA = totalStudents > 0 
      ? students.reduce((sum, s) => sum + parseFloat(s.cgpa), 0) / totalStudents 
      : 0;

    return {
      totalStudents,
      deansListCount,
      probationCount,
      averageCGPA: Math.round(averageCGPA * 100) / 100
    };
  }

  async getDashboardPerformance(semester?: string): Promise<PerformanceData> {
    let students: StudentWithSubjects[];
    
    if (semester && semester !== 'all') {
      students = await this.getStudentsBySemester(semester);
    } else {
      students = await this.getAllStudents();
    }

    const deansListStudents = students.filter(s => parseFloat(s.cgpa) >= 3.75 && s.credits >= 12);
    const probationStudents = students.filter(s => parseFloat(s.cgpa) < 2.00 && s.credits > 0);
    const goodStandingStudents = students.filter(s => {
      const cgpa = parseFloat(s.cgpa);
      return cgpa >= 2.00 && (cgpa < 3.75 || s.credits < 12);
    });

    return {
      deansListStudents,
      probationStudents,
      goodStandingStudents
    };
  }


}

export const storage = new MemStorage();
