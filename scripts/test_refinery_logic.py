
import unittest
from refinery import process_job

class TestRefinery(unittest.TestCase):
    
    def test_batch_extraction(self):
        # Case 1: Explicit Year
        job = {
            "title": "SDE Intern 2026",
            "description": "Looking for 2026 graduates.",
            "location": "Bangalore"
        }
        result = process_job(job)
        self.assertIn('2026', result['batch'])
        
        # Case 2: Relative "Final Year" (Mapped to 2026)
        job = {
            "title": "Software Engineer - Final Year",
            "description": "Open to final year students.",
            "location": "Pune"
        }
        result = process_job(job)
        self.assertIn('2026', result['batch'])
        
        # Case 3: "Fresher" (Mapped to 2025, 2026)
        job = {
            "title": "Fresher Hiring",
            "description": "Freshers can apply.",
            "location": "Hyderabad"
        }
        result = process_job(job)
        self.assertIn('2025', result['batch'])
        self.assertIn('2026', result['batch'])

    def test_tech_stack_extraction(self):
        job = {
            "title": "React Frontend Developer",
            "description": "Must know Node.js and AWS.",
            "location": "Remote"
        }
        result = process_job(job)
        self.assertIn("React", result['tech_stack'])
        self.assertIn("Node.js", result['tech_stack'])
        self.assertIn("AWS", result['tech_stack'])
        self.assertNotIn("Python", result['tech_stack'])

    def test_location_normalization(self):
        # Case 1: Bengaluru -> Bangalore
        job = {
            "title": "SDE",
            "location": "Bengaluru, Karnataka"
        }
        result = process_job(job)
        self.assertEqual(result['normalized_location'], "Bangalore")
        self.assertEqual(result['work_mode'], "On-site")
        
        # Case 2: Remote in Title
        job = {
            "title": "SDE (Remote)",
            "location": "Mumbai"
        }
        result = process_job(job)
        self.assertEqual(result['work_mode'], "Remote")
        
        # Case 3: Hybrid
        job = {
            "title": "SDE",
            "location": "Hybrid - Delhi"
        }
        result = process_job(job)
        self.assertEqual(result['work_mode'], "Hybrid")

    def test_job_type_inference(self):
        # Case 1: Intern
        job = {
            "title": "SDE Intern",
            "description": "Good stipend."
        }
        result = process_job(job)
        self.assertEqual(result['job_type'], "Internship")
        
        # Case 2: Trainee
        job = {
            "title": "Graduate Engineer Trainee",
            "description": "..."
        }
        result = process_job(job)
        self.assertEqual(result['job_type'], "Internship")
        
        # Case 3: Full-time (Default)
        job = {
            "title": "SDE I",
            "description": "Full time role."
        }
        result = process_job(job)
        self.assertEqual(result['job_type'], "Full-time")

if __name__ == '__main__':
    unittest.main()
