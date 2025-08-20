import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertSubjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const { semester } = req.query;
      const metrics = await storage.getDashboardMetrics(semester as string);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get performance data for charts
  app.get("/api/dashboard/performance", async (req, res) => {
    try {
      const { semester } = req.query;
      const performanceData = await storage.getPerformanceData(semester as string);
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Get all students (specific route first to avoid conflicts)
  app.get("/api/students/all", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get all students with semester filtering
  app.get("/api/students", async (req, res) => {
    try {
      const { semester } = req.query;
      let students;
      
      if (semester && semester !== 'all') {
        students = await storage.getStudentsBySemester(semester as string);
      } else {
        students = await storage.getAllStudents();
      }
      
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get student by ID (this must be after specific routes)
  app.get("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Create new student
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Update student
  app.patch("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validatedData);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Delete student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteStudent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Create subject for student
  app.post("/api/students/:studentId/subjects", async (req, res) => {
    try {
      const { studentId } = req.params;
      const validatedData = insertSubjectSchema.parse({
        ...req.body,
        studentId
      });
      
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Get available semesters
  app.get("/api/semesters", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      const semesterSet = new Set(students.map(s => s.intake));
      const semesters = Array.from(semesterSet).sort();
      res.json(semesters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch semesters" });
    }
  });

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics/:semester", async (req, res) => {
    try {
      const { semester } = req.params;
      const metrics = await storage.getDashboardMetrics(semester);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Dashboard performance endpoint
  app.get("/api/dashboard/performance/:semester", async (req, res) => {
    try {
      const { semester } = req.params;
      const performanceData = await storage.getDashboardPerformance(semester);
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
