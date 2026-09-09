# WALTZ Fitness

A mobile-first personalized workout app prototype.

## Current MVP
- Guided onboarding: gender presentation, age, body shape, goal, measurements, focus areas, experience, location, weekly schedule, limitations
- Personalized 12-week program generation
- 3/4/5/6-day workout splits
- Separate male/female default 5-day templates
- Exercise library for upper and lower body
- 5 training phases across 12 weeks
- Workout player with sets, weight and reps tracking
- Local progress persistence using browser localStorage
- Exercise-demo placeholders ready for AI-generated videos
- Installable PWA manifest

## Run locally
Any static server works:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Important
This MVP is fitness guidance software, not medical care. Future production versions should include user accounts, a backend/database, authentication, consent/privacy flows, validated exercise video content, and screening for medical/exercise contraindications.

## Next build phases
1. Supabase/Postgres accounts + cloud progress sync
2. Real exercise video library
3. WALTZ AI Coach
4. Adaptive progression based on completed sets
5. Nutrition/calorie module
6. Subscriptions and payments
7. Native iOS/Android wrapper or React Native app
