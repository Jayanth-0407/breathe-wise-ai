from typing import List
from app.schemas.indoor import IndoorWorkoutItem, IndoorWorkoutResponse

class IndoorService:
    WORKOUT_TEMPLATES = [
        {
            "id": "iw-1",
            "title": "Low-Impact Indoor Walking & Stepping",
            "category": "Indoor Walking",
            "difficulty": "Beginner",
            "target_heart_rate_zone": "Zone 1-2 (Active Recovery)",
            "instructions": [
                "Warm-up: 3 minutes gentle shoulder rolls and high knee marches in place.",
                "Interval 1: 5 minutes brisk indoor corridor stepping with pumping arms.",
                "Interval 2: 3 minutes side-steps with overhead reach.",
                "Interval 3: 5 minutes paced hallway walking with alternating forward heel touches.",
                "Cool-down: 2 minutes calf stretches and steady breathing."
            ],
            "benefits": "Maintains daily step goals and circulation without deep particulate lung inhalation.",
            "clean_air_tips": ["Ensure room has active HEPA filtration running 15 minutes prior to workout."]
        },
        {
            "id": "iw-2",
            "title": "Pranayama & Restorative Lung Mobility Yoga",
            "category": "Yoga & Stretching",
            "difficulty": "Beginner",
            "target_heart_rate_zone": "Zone 1 (Parasympathetic Activation)",
            "instructions": [
                "Diaphragmatic breathing (Belly breathing): 4 minutes to stabilize chest expansion.",
                "Cat-Cow Flow (Marjaryasana-Bitilasana): 10 breath cycles to mobilze thoracic spine.",
                "Gentle Twists and Chest Openers (Matsyasana variation): 6 minutes.",
                "Forward folds with supported exhalations: 5 minutes.",
                "Savasana: 3 minutes grounded breathing."
            ],
            "benefits": "Expands intercostal flexibility and reduces airway bronchospasm without high ventilation rates.",
            "clean_air_tips": ["Wipe down yoga mat with a damp microfiber cloth to avoid resuspending indoor settling dust."]
        },
        {
            "id": "iw-3",
            "title": "Clean-Air Bodyweight Functional Strength",
            "category": "Bodyweight Fitness",
            "difficulty": "Intermediate",
            "target_heart_rate_zone": "Zone 2-3 (Aerobic Conditioning)",
            "instructions": [
                "Bodyweight squats: 3 sets of 12-15 repetitions.",
                "Wall push-ups or standard push-ups: 3 sets of 10-12 repetitions.",
                "Glute bridges and bird-dogs: 3 sets of 10 repetitions per side.",
                "Standing mountain climbers (steady pace): 3 sets of 30 seconds.",
                "Plank hold: 3 sets of 30-45 seconds."
            ],
            "benefits": "Preserves muscular strength and metabolic rate while minimizing heavy aerobic ventilation.",
            "clean_air_tips": ["Keep room windows and doors tightly sealed during the session."]
        },
        {
            "id": "iw-4",
            "title": "Low-Impact Aerobic Cardio Circuit",
            "category": "Low-Impact Cardio",
            "difficulty": "Intermediate",
            "target_heart_rate_zone": "Zone 2-3 (Cardiorespiratory Health)",
            "instructions": [
                "Marching jacks (step-touch without jumping): 45 seconds.",
                "Skaters (low impact lateral bounds): 45 seconds.",
                "Shadow boxing (jabs, crosses, hooks with active footwork): 60 seconds.",
                "Standing knee-to-elbow crunches: 45 seconds.",
                "Repeat circuit 3-4 rounds with 45-second rests between rounds."
            ],
            "benefits": "Elevates heart rate and burns calories without heavy impact or outdoor smog exposure.",
            "clean_air_tips": ["Run HEPA purifier on Medium or High speed during active cardio."]
        }
    ]

    CLEAN_AIR_PROTOCOL = [
        "Seal windows and exterior doors tightly during high outdoor AQI events.",
        "Position your HEPA air cleaner in the room where you exercise, running at least 15 minutes before starting.",
        "Avoid lighting incense, scented candles, or frying food during or before indoor workouts.",
        "Use a damp microfiber mop or cloth rather than dry sweeping to prevent stirring up settled coarse dust.",
        "Time natural cross-ventilation strictly during afternoon hours (1 PM - 4 PM) when outdoor PM2.5 levels dip."
    ]

    @classmethod
    def get_recommendations(cls, fitness_level: str = "intermediate", duration_minutes: int = 30) -> IndoorWorkoutResponse:
        filtered = [
            IndoorWorkoutItem(
                id=w["id"],
                title=w["title"],
                category=w["category"],
                difficulty=w["difficulty"],
                duration_minutes=duration_minutes,
                target_heart_rate_zone=w["target_heart_rate_zone"],
                instructions=w["instructions"],
                benefits=w["benefits"],
                clean_air_tips=w["clean_air_tips"],
            )
            for w in cls.WORKOUT_TEMPLATES
        ]

        return IndoorWorkoutResponse(
            fitness_level=fitness_level,
            duration_minutes=duration_minutes,
            routines=filtered,
            clean_indoor_air_protocol=cls.CLEAN_AIR_PROTOCOL,
            hepa_guidance="Follow the EPA 2/3 Rule: Ensure your air purifier's CADR (Smoke) rating in CFM is at least 2/3 the room floor area in square feet.",
        )
