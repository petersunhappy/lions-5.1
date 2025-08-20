import {
  type User, type InsertUser,
  type Athlete, type InsertAthlete,
  type Exercise, type InsertExercise,
  type TrainingSession, type InsertTrainingSession,
  type Event, type InsertEvent,
  type GalleryItem, type InsertGalleryItem,
  type BestOfWeek, type InsertBestOfWeek,
  type LiveStream, type InsertLiveStream
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Athlete management
  getAthlete(id: string): Promise<Athlete | undefined>;
  getAthleteByUserId(userId: string): Promise<Athlete | undefined>;
  getAllAthletes(): Promise<Athlete[]>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  updateAthlete(id: string, updates: Partial<Athlete>): Promise<Athlete | undefined>;
  deleteAthlete(id: string): Promise<boolean>;
  
  // Exercise management
  getExercise(id: string): Promise<Exercise | undefined>;
  getAllExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;
  
  // Training sessions
  getTrainingSession(id: string): Promise<TrainingSession | undefined>;
  getTrainingSessionsByAthlete(athleteId: string): Promise<TrainingSession[]>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession | undefined>;
  
  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Gallery
  getGalleryItem(id: string): Promise<GalleryItem | undefined>;
  getAllGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByAlbum(album: string): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  deleteGalleryItem(id: string): Promise<boolean>;
  
  // Best of the week
  getCurrentBestOfWeek(): Promise<BestOfWeek | undefined>;
  setBestOfWeek(bestOfWeek: InsertBestOfWeek): Promise<BestOfWeek>;
  
  // Live streams
  getLiveStream(id: string): Promise<LiveStream | undefined>;
  getAllLiveStreams(): Promise<LiveStream[]>;
  getActiveLiveStreams(): Promise<LiveStream[]>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  updateLiveStream(id: string, updates: Partial<LiveStream>): Promise<LiveStream | undefined>;
  deleteLiveStream(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private athletes: Map<string, Athlete> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private trainingSessions: Map<string, TrainingSession> = new Map();
  private events: Map<string, Event> = new Map();
  private galleryItems: Map<string, GalleryItem> = new Map();
  private bestOfWeeks: Map<string, BestOfWeek> = new Map();
  private liveStreams: Map<string, LiveStream> = new Map();

  constructor() {
    // Initialize with some default data for development
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      email: "admin@lions.com",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      fullName: "Administrador Lions",
      profilePicture: null,
      position: null,
      createdAt: new Date(),
    };
    this.users.set(adminId, adminUser);

    // Create sample athlete user
    const athleteId = randomUUID();
    const athleteUser: User = {
      id: athleteId,
      username: "joao",
      email: "joao@lions.com",
      password: "athlete123",
      role: "athlete",
      fullName: "João Silva",
      profilePicture: null,
      position: "Ala",
      createdAt: new Date(),
    };
    this.users.set(athleteId, athleteUser);

    // Create athlete profile
    const athlete: Athlete = {
      id: randomUUID(),
      userId: athleteId,
      height: "1.85m",
      weight: "78kg",
      sleepHours: "7.5",
      overallPerformance: "85.50",
      lastTraining: new Date(),
    };
    this.athletes.set(athlete.id, athlete);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "athlete",
      profilePicture: insertUser.profilePicture || null,
      position: insertUser.position || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Athlete methods
  async getAthlete(id: string): Promise<Athlete | undefined> {
    return this.athletes.get(id);
  }

  async getAthleteByUserId(userId: string): Promise<Athlete | undefined> {
    return Array.from(this.athletes.values()).find(athlete => athlete.userId === userId);
  }

  async getAllAthletes(): Promise<Athlete[]> {
    return Array.from(this.athletes.values());
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const id = randomUUID();
    const athlete: Athlete = { 
      ...insertAthlete, 
      id,
      height: insertAthlete.height || null,
      weight: insertAthlete.weight || null,
      sleepHours: insertAthlete.sleepHours || null,
      overallPerformance: insertAthlete.overallPerformance || null,
      lastTraining: insertAthlete.lastTraining || null
    };
    this.athletes.set(id, athlete);
    return athlete;
  }

  async updateAthlete(id: string, updates: Partial<Athlete>): Promise<Athlete | undefined> {
    const athlete = this.athletes.get(id);
    if (!athlete) return undefined;
    const updatedAthlete = { ...athlete, ...updates };
    this.athletes.set(id, updatedAthlete);
    return updatedAthlete;
  }

  async deleteAthlete(id: string): Promise<boolean> {
    return this.athletes.delete(id);
  }

  // Exercise methods
  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => exercise.category === category);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { 
      ...insertExercise, 
      id,
      description: insertExercise.description || null,
      videoUrl: insertExercise.videoUrl || null,
      metrics: insertExercise.metrics as Exercise['metrics'] || null
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;
    const updatedExercise = { ...exercise, ...updates };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: string): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Training session methods
  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    return this.trainingSessions.get(id);
  }

  async getTrainingSessionsByAthlete(athleteId: string): Promise<TrainingSession[]> {
    return Array.from(this.trainingSessions.values()).filter(session => session.athleteId === athleteId);
  }

  async createTrainingSession(insertSession: InsertTrainingSession): Promise<TrainingSession> {
    const id = randomUUID();
    const session: TrainingSession = { 
      ...insertSession, 
      id, 
      results: insertSession.results as TrainingSession['results'] || null,
      completedAt: new Date()
    };
    this.trainingSessions.set(id, session);
    return session;
  }

  async updateTrainingSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession | undefined> {
    const session = this.trainingSessions.get(id);
    if (!session) return undefined;
    const updatedSession = { ...session, ...updates };
    this.trainingSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(event => event.startDate > now);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      description: insertEvent.description || null,
      endDate: insertEvent.endDate || null,
      mandatory: insertEvent.mandatory || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Gallery methods
  async getGalleryItem(id: string): Promise<GalleryItem | undefined> {
    return this.galleryItems.get(id);
  }

  async getAllGalleryItems(): Promise<GalleryItem[]> {
    return Array.from(this.galleryItems.values());
  }

  async getGalleryItemsByAlbum(album: string): Promise<GalleryItem[]> {
    return Array.from(this.galleryItems.values()).filter(item => item.album === album);
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const id = randomUUID();
    const item: GalleryItem = { 
      ...insertItem, 
      id, 
      description: insertItem.description || null,
      album: insertItem.album || null,
      uploadedAt: new Date() 
    };
    this.galleryItems.set(id, item);
    return item;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    return this.galleryItems.delete(id);
  }

  // Best of the week methods
  async getCurrentBestOfWeek(): Promise<BestOfWeek | undefined> {
    const currentWeekStart = this.getStartOfWeek(new Date());
    return Array.from(this.bestOfWeeks.values())
      .find(best => best.weekStart.getTime() === currentWeekStart.getTime());
  }

  async setBestOfWeek(insertBestOfWeek: InsertBestOfWeek): Promise<BestOfWeek> {
    const id = randomUUID();
    const bestOfWeek: BestOfWeek = { 
      ...insertBestOfWeek, 
      id,
      achievements: insertBestOfWeek.achievements as BestOfWeek['achievements'] || null
    };
    this.bestOfWeeks.set(id, bestOfWeek);
    return bestOfWeek;
  }

  // Live stream methods
  async getLiveStream(id: string): Promise<LiveStream | undefined> {
    return this.liveStreams.get(id);
  }

  async getAllLiveStreams(): Promise<LiveStream[]> {
    return Array.from(this.liveStreams.values());
  }

  async getActiveLiveStreams(): Promise<LiveStream[]> {
    return Array.from(this.liveStreams.values()).filter(stream => stream.isActive);
  }

  async createLiveStream(insertStream: InsertLiveStream): Promise<LiveStream> {
    const id = randomUUID();
    const stream: LiveStream = { 
      ...insertStream, 
      id,
      description: insertStream.description || null,
      category: insertStream.category || null,
      isActive: insertStream.isActive || null,
      scheduledFor: insertStream.scheduledFor || null
    };
    this.liveStreams.set(id, stream);
    return stream;
  }

  async updateLiveStream(id: string, updates: Partial<LiveStream>): Promise<LiveStream | undefined> {
    const stream = this.liveStreams.get(id);
    if (!stream) return undefined;
    const updatedStream = { ...stream, ...updates };
    this.liveStreams.set(id, updatedStream);
    return updatedStream;
  }

  async deleteLiveStream(id: string): Promise<boolean> {
    return this.liveStreams.delete(id);
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }
}

export const storage = new MemStorage();
