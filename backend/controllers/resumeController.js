
const Resume = require('../models/Resume');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      userId: req.user._id,
      status: 'draft',
      ...req.body
    });
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveDraft = async (req, res) => {
  const { id, ...data } = req.body;
  try {
    let resume;
    // Check if id is a valid mongo id or the string 'new'
    const isValidId = id && id.match(/^[0-9a-fA-F]{24}$/);
    
    if (isValidId) {
      resume = await Resume.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { ...data, status: 'draft', updatedAt: Date.now() },
        { new: true, upsert: true }
      );
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        status: 'draft',
        ...data
      });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'final', updatedAt: Date.now() },
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if(resume && resume.userId.toString() === req.user._id.toString()) {
      res.json(resume);
    } else {
      res.status(404).json({ message: 'Resume not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedResume) return res.status(404).json({ message: 'Resume not found' });
    res.json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scoreResume = async (req, res) => {
  const { resumeData } = req.body;
  if (!process.env.API_KEY) {
    return res.status(500).json({ message: 'Server missing API Key' });
  }
  const prompt = `Act as a professional ATS and expert Resume Critic. Evaluate the following resume data. Return JSON with overall score, breakdown, and feedback tips.
  ${JSON.stringify(resumeData)}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: 'AI Scoring failed' });
  }
};
