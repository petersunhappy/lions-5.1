import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAthleteSchema, insertExerciseSchema, insertTrainingSessionSchema, insertEventSchema, insertGallerySchema, insertBestOfWeekSchema, insertLiveStreamSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd set up proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role, 
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          position: user.position
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Create athlete profile if role is athlete
      if (userData.role === "athlete") {
        await storage.createAthlete({
          userId: user.id,
          height: null,
          weight: null,
          sleepHours: null,
          overallPerformance: "0",
          lastTraining: null,
        });
      }

      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role, 
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          position: user.position
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Athlete routes
  app.get("/api/athletes", async (req, res) => {
    try {
      const athletes = await storage.getAllAthletes();
      
      // Get user details for each athlete
      const athletesWithUsers = await Promise.all(
        athletes.map(async (athlete) => {
          const user = await storage.getUser(athlete.userId);
          return { ...athlete, user };
        })
      );
      
      res.json(athletesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/athletes/:id", async (req, res) => {
    try {
      const athlete = await storage.getAthlete(req.params.id);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const user = await storage.getUser(athlete.userId);
      res.json({ ...athlete, user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/athletes", async (req, res) => {
    try {
      const athleteData = insertAthleteSchema.parse(req.body);
      const athlete = await storage.createAthlete(athleteData);
      res.status(201).json(athlete);
    } catch (error) {
      res.status(400).json({ message: "Invalid athlete data" });
    }
  });

  app.put("/api/athletes/:id", async (req, res) => {
    try {
      const updates = req.body;
      const athlete = await storage.updateAthlete(req.params.id, updates);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      res.json(athlete);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/athletes/:id", async (req, res) => {
    try {
      const success = await storage.deleteAthlete(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category } = req.query;
      
      let exercises;
      if (category) {
        exercises = await storage.getExercisesByCategory(category as string);
      } else {
        exercises = await storage.getAllExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  app.put("/api/exercises/:id", async (req, res) => {
    try {
      const updates = req.body;
      const exercise = await storage.updateExercise(req.params.id, updates);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const success = await storage.deleteExercise(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Training session routes
  app.get("/api/training-sessions", async (req, res) => {
    try {
      const { athleteId } = req.query;
      
      let sessions;
      if (athleteId) {
        sessions = await storage.getTrainingSessionsByAthlete(athleteId as string);
      } else {
        return res.status(400).json({ message: "athleteId is required" });
      }
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/training-sessions", async (req, res) => {
    try {
      const sessionData = insertTrainingSessionSchema.parse(req.body);
      const session = await storage.createTrainingSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid training session data" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { upcoming } = req.query;
      
      let events;
      if (upcoming === "true") {
        events = await storage.getUpcomingEvents();
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const updates = req.body;
      const event = await storage.updateEvent(req.params.id, updates);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const success = await storage.deleteEvent(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const { album } = req.query;
      
      let items;
      if (album) {
        items = await storage.getGalleryItemsByAlbum(album as string);
      } else {
        items = await storage.getAllGalleryItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const galleryData = insertGallerySchema.parse(req.body);
      const item = await storage.createGalleryItem(galleryData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid gallery item data" });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const success = await storage.deleteGalleryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Best of the week routes
  app.get("/api/best-of-week", async (req, res) => {
    try {
      const bestOfWeek = await storage.getCurrentBestOfWeek();
      if (!bestOfWeek) {
        return res.status(404).json({ message: "No best of week set" });
      }
      
      const athlete = await storage.getAthlete(bestOfWeek.athleteId);
      const user = athlete ? await storage.getUser(athlete.userId) : null;
      
      res.json({ ...bestOfWeek, athlete: { ...athlete, user } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/best-of-week", async (req, res) => {
    try {
      const bestOfWeekData = insertBestOfWeekSchema.parse(req.body);
      const bestOfWeek = await storage.setBestOfWeek(bestOfWeekData);
      res.status(201).json(bestOfWeek);
    } catch (error) {
      res.status(400).json({ message: "Invalid best of week data" });
    }
  });

  // Live stream routes
  app.get("/api/live-streams", async (req, res) => {
    try {
      const { active } = req.query;
      
      let streams;
      if (active === "true") {
        streams = await storage.getActiveLiveStreams();
      } else {
        streams = await storage.getAllLiveStreams();
      }
      
      res.json(streams);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/live-streams", async (req, res) => {
    try {
      const streamData = insertLiveStreamSchema.parse(req.body);
      const stream = await storage.createLiveStream(streamData);
      res.status(201).json(stream);
    } catch (error) {
      res.status(400).json({ message: "Invalid live stream data" });
    }
  });

  app.put("/api/live-streams/:id", async (req, res) => {
    try {
      const updates = req.body;
      const stream = await storage.updateLiveStream(req.params.id, updates);
      if (!stream) {
        return res.status(404).json({ message: "Live stream not found" });
      }
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/live-streams/:id", async (req, res) => {
    try {
      const success = await storage.deleteLiveStream(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Live stream not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
