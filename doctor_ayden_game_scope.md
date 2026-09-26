# Doctor Ayden to the Rescue!
## 2D Children's Hospital Game — Product & Game Design Scope

**Working Title:** Doctor Ayden to the Rescue!  
**Genre:** 2D hospital management / role-play / mini-game  
**Primary Inspiration:** Cooking Mama, simple time-management games, children's role-play games  
**Target Audience:** Children approximately 4–9 years old  
**Platform:** Initially PC / Web / Tablet; architecture should allow later mobile deployment  
**Camera:** Top-down or 3/4 isometric 2D  
**Player Character:** Doctor Ayden, a cheerful young Chinese boy doctor  
**Core Theme:** Helping patients feel better through checkups, collecting supplies, simple treatments, and procedure mini-games.

---

# 1. Game Vision

**Doctor Ayden to the Rescue!** is a cheerful 2D hospital game where the player controls Doctor Ayden as he helps patients.

Patients arrive with visible symptoms or complaints. Doctor Ayden examines them, discovers what they need, collects the appropriate supplies or medicine, performs treatments through simple interactive mini-games, and escorts patients to specialist rooms when required.

The game should prioritize:

- Simple controls
- Clear visual instructions
- Short, satisfying tasks
- Positive feedback
- Cute character interactions
- Low frustration
- Replayability
- Gradual increase in difficulty
- The fantasy of "being the doctor"

The game should **not** aim to simulate real medical practice accurately.

Real medicine names may optionally appear in a parent-controlled educational mode, but the normal children's experience should preferably use simplified categories such as:

- Fever Medicine
- Allergy Medicine
- Cough Medicine
- Pain Medicine

This avoids presenting the game as real-world medical instructions.

---

# 2. Core Player Fantasy

The player should feel:

> "I am Doctor Ayden. Patients need me. I examine them, figure out what they need, get the right equipment, and make them feel better."

The player's role is not simply to fetch objects.

The intended loop is:

**Patient arrives → Symptoms → Checkup → Treatment identified → Gather supplies → Perform treatment → Patient recovers → Reward**

---

# 3. Main Character

## Doctor Ayden

### Visual Design

Doctor Ayden should be represented as:

- Young Chinese boy
- White doctor coat
- Stethoscope around neck
- Comfortable shoes/sneakers
- Friendly facial expression
- Slightly oversized doctor equipment for a playful style
- Bright, recognizable silhouette
- Child-friendly proportions rather than realistic anatomy

Optional accessories:

- Doctor bag
- Clipboard
- Name badge reading "Dr. Ayden"
- Watch
- Pocket pen
- Small medical flashlight

### Required Animations

Minimum:

- Idle
- Walk/run up
- Walk/run down
- Walk/run left
- Walk/run right
- Pick up item
- Carry item
- Interact
- Examine patient
- Push wheelchair
- Celebrate
- Thinking/confused
- Success pose

Optional:

- Wash hands
- Use stethoscope
- Write on clipboard
- Wave to patient
- High-five patient

### Character Catchphrases

Examples:

- "Doctor Ayden to the rescue!"
- "Let's check you out!"
- "All better!"
- "Good job!"
- "I know what we need!"
- "Let's help our next patient!"

Voice acting can be optional for MVP.

---

# 4. Core Gameplay Loop

Each patient follows the following general flow.

## Step 1 — Patient Arrives

A patient enters or appears in the waiting/patient room.

The patient may:

- Walk in
- Be seated
- Lie on a bed
- Arrive in a wheelchair
- Be accompanied by a parent
- Be called from a waiting area

A visual indicator appears when the patient needs attention.

Example:

`!`

or:

`🩺`

---

## Step 2 — Patient Shows Symptoms

The patient should initially communicate **what feels wrong**, rather than directly telling the player the treatment.

Examples:

- Sneezing
- Coughing
- Holding stomach
- Holding knee
- Looking tired
- Fever animation
- Scraped arm
- Itchy eyes
- Ear discomfort
- Headache
- Small bruise

A speech/thought bubble may combine icons and optional text.

Example:

`🤧 + 👃`

Optional dialogue:

> "Achoo! I can't stop sneezing!"

---

# 5. Patient Request UI

Patient communication should operate in three stages.

## Stage A — Symptom Bubble

Appears when the patient first needs help.

Examples:

- 🌡️
- 🤕 + 🦵
- 🤧
- 😷 + cough lines
- 👂 + 😣
- 🫃 + 😣
- 👁️ + itch symbol

The bubble should not normally reveal the exact treatment.

---

## Stage B — Checkup / Treatment Card

After the player completes the examination, a treatment card appears.

Example:

### Mia
**Problem:** Scraped Knee

**Treatment**

- 🧴 Clean wound
- 🩹 Apply gauze

Another example:

### Lucas
**Symptoms:** Sneezing + Itchy Eyes

**Treatment**

- 🌼 Allergy Medicine
- 🥤 Water
- 🛏️ Rest

---

## Stage C — Active Treatment Checklist

Once the treatment begins, a checklist displays progress.

Example:

**Lucas**

- ✅ Check temperature
- ✅ Listen to chest
- ⬜ Get allergy medicine
- ⬜ Give medicine
- ⬜ Let patient rest

The checklist may appear:

- Above patient
- On a side UI panel
- Inside Doctor Ayden's clipboard

---

# 6. Doctor Clipboard

The clipboard acts as the player's central task interface.

Opening it displays all active patients.

Example:

## Current Patients

### Bed 1 — Mia
🙂 Happiness: 3/3

- ✅ Examine knee
- ⬜ Get antiseptic
- ⬜ Get gauze
- ⬜ Apply dressing

### Bed 2 — Lucas
🙂 Happiness: 2/3

- ⬜ Check temperature
- ⬜ Listen with stethoscope

### Bed 3 — Emma

Waiting for treatment.

The clipboard helps prevent confusion when several patients are active.

---

# 7. Hospital Layout

The initial hospital should be relatively small.

The player should be able to learn the environment quickly.

## 7.1 Reception / Waiting Area

Functions:

- Patients enter
- Patients wait
- New patient notification
- Optional receptionist NPC
- Tutorial messages

Possible decorations:

- Fish tank
- Toys
- Chairs
- Children's books
- Plants
- Clock

---

## 7.2 Patient Room

Primary treatment area.

Contains:

- 3–5 patient beds/chairs
- Medical stools
- Examination station
- Handwashing sink
- Simple tools
- Patient monitors as decoration
- Clipboard station

Most checkups begin here.

---

## 7.3 Medicine & Supply Room

Contains shelves for treatment supplies.

Possible categories:

### Medicines

- Fever Medicine
- Allergy Medicine
- Cough Medicine
- Pain Medicine
- Tummy Medicine

### Treatment Supplies

- Gauze
- Bandages
- Antiseptic
- Cotton
- Ice pack
- Gloves

### Equipment

- Thermometer
- Stethoscope
- Otoscope
- Syringe
- Reflex hammer
- Flashlight

Items should have:

- Distinct shapes
- Distinct icons
- Strong visual differentiation

Avoid relying only on color so that the game remains understandable for players with color-vision differences.

---

## 7.4 Procedure Room

Used for treatments that cannot happen at the patient's bed.

Examples:

- Injection
- Advanced bandaging
- Cast
- Small procedure
- Blood pressure examination

Patients may need to be transported here.

---

## 7.5 X-Ray Room

Possible later unlock.

Gameplay:

1. Bring patient via wheelchair.
2. Position body part.
3. Activate X-ray.
4. Complete alignment mini-game.
5. View cartoon X-ray.
6. Return patient.

---

## 7.6 Recovery Room

Optional room.

Some treatments require patients to rest.

Gameplay examples:

- Bring patient to recovery bed.
- Give water.
- Give blanket.
- Wait for recovery bar.
- Check patient before discharge.

---

# 8. Movement & Controls

Controls should be extremely simple.

## Desktop

- WASD / Arrow Keys — Move
- E / Space — Interact
- Mouse — Mini-games
- Tab / C — Clipboard

## Tablet / Mobile

- Virtual joystick
- Tap interaction button
- Drag-and-drop mini-games
- Large touch targets

Optional accessibility mode:

- Tap location and Doctor Ayden automatically walks there.

---

# 9. Interactions

Interactable objects should visually indicate usability.

Possible indicators:

- Highlight outline
- Gentle bounce
- Sparkle
- Interaction icon
- "E" prompt
- Hand icon

Possible interactions:

- Talk to patient
- Examine patient
- Pick up medicine
- Pick up equipment
- Open supply cupboard
- Push wheelchair
- Open door
- Use examination device
- Place item on tray
- Wash hands

---

# 10. Inventory System

Keep inventory deliberately simple.

Recommended:

Doctor Ayden can carry:

**2–3 items maximum**

Example:

| Slot | Item |
|---|---|
| 1 | Gauze |
| 2 | Antiseptic |
| 3 | Empty |

This creates light planning without becoming complicated.

Alternatively, Doctor Ayden can carry one physical item at a time for younger players.

Difficulty settings may alter inventory capacity.

---

# 11. Patient Types

Patients should vary visually and behaviorally.

Examples:

- Young child
- Older child
- Adult
- Elderly person
- Parent
- Athlete
- Chef
- Teacher
- Construction worker
- Police officer
- Firefighter

Patients can have different personalities.

Examples:

### Nervous Patient

Needs reassurance before treatment.

### Happy Patient

Patient remains calm and gives large happiness bonuses.

### Impatient Patient

Happiness decreases slightly faster.

### Sleepy Patient

May fall asleep while waiting.

### Curious Child

Asks Doctor Ayden questions.

---

# 12. Example Conditions

Conditions should be simplified and cartoon-oriented.

## Tier 1 — Very Simple

- Fever
- Sneezing/allergy
- Cough
- Small scrape
- Small cut
- Bruise
- Headache
- Tummy ache

## Tier 2 — Multiple Actions

- Larger scrape
- Sprained ankle
- Ear discomfort
- Eye irritation
- Dehydration
- Minor burn
- Cold/flu-like symptoms

## Tier 3 — Procedure-Based

- Arm requiring X-ray
- Leg requiring X-ray
- Cast
- Injection
- Wound dressing
- Multiple-step checkup

Complex or frightening medical situations should be avoided.

---

# 13. Examination Mini-Games

## 13.1 Stethoscope

### Objective

Listen to the patient's chest.

### Interaction

Several glowing targets appear.

Player moves the stethoscope to each target and holds it there.

Example:

1. Upper left chest
2. Upper right chest
3. Lower chest

Each successful location produces:

`thump-thump`

Reward:

**Perfect Listening!**

---

## 13.2 Thermometer

### Objective

Take patient's temperature.

### Interaction

- Position thermometer
- Hold steady
- Wait until meter completes

Optional timing mechanic:

Release when indicator enters green zone.

---

## 13.3 Ear Examination

### Objective

Look inside patient's ear.

### Interaction

Move otoscope toward highlighted area.

Inside view appears.

Player may identify:

- Normal
- Irritated
- Cartoon blockage

Keep visuals non-graphic.

---

## 13.4 Reflex Test

Tap knee at correct moment.

Leg performs exaggerated kick animation.

---

## 13.5 Eye Examination

Possible games:

- Follow moving light
- Identify shape
- Match eye chart symbol

---

# 14. Treatment Mini-Games

## 14.1 Medicine Selection

Treatment card shows medicine icon.

Player must:

1. Walk to medicine room.
2. Find correct medicine.
3. Pick it up.
4. Return to patient.
5. Place medicine on patient tray.

Incorrect item:

Patient shakes head.

Message:

> "Hmm... that's not the one!"

No harmful treatment occurs.

---

## 14.2 Wound Cleaning

Interaction:

Player swipes gently over marked areas.

Stages:

1. Clean dirt
2. Apply antiseptic
3. Dry area

Completion:

Sparkle animation.

---

## 14.3 Gauze / Bandage

Stages:

1. Position gauze
2. Drag bandage around wound
3. Complete required wraps
4. Clip bandage

Scoring based on:

- Accuracy
- Smoothness
- Completion

---

## 14.4 Ice Pack

Drag ice pack onto bruise.

Keep it in correct location while progress circle fills.

---

## 14.5 Injection

Highly cartoonized.

Stages may include:

1. Prepare equipment
2. Clean arm
3. Position injection
4. Tap/hold

Avoid detailed needle imagery for younger audiences.

Optional setting:

**Needle-Free Mode**

Injection can be represented by a patch or cartoon device.

---

## 14.6 Cast

Possible sequence:

1. Position padding
2. Wrap cast
3. Smooth surface
4. Patient chooses cast color

Optional bonus:

Patient decorates cast with stickers.

---

# 15. Wheelchair Mechanic

Some patients require transportation.

Treatment card displays:

`🧑‍🦽 → X-RAY ROOM`

Player must:

1. Find wheelchair.
2. Push wheelchair beside patient.
3. Interact.
4. Patient sits down.
5. Doctor Ayden moves behind chair.
6. Player pushes patient to destination.
7. Park in marked area.
8. Perform treatment/procedure.
9. Return patient or move them to recovery.

Possible fun environmental obstacles:

- Cleaning cart
- Nurse walking
- Toy on floor
- Delivery trolley

Collisions should be harmless.

Patient reacts:

> "Oops!"

No health penalty.

---

# 16. Patient Happiness System

Use **Happiness**, not health.

Example states:

### Happy
😄

### Comfortable
🙂

### Waiting
😐

### Impatient
😟

Happiness decreases slowly while waiting.

Happiness increases when:

- Doctor begins examination
- Correct treatment performed
- Patient reassured
- Treatment mini-game performed well
- Patient receives comfort item

Possible comfort actions:

- Give water
- Give toy
- Talk
- Give blanket

---

# 17. Mistakes

Mistakes should create mild consequences rather than failure.

Examples:

### Wrong Medicine

- Patient shakes head
- Item automatically returned
- Small efficiency deduction

### Wrong Supply

- Prompt indicates mismatch
- No treatment performed

### Mini-Game Mistake

- Player retries
- Skill score slightly reduced

### Bumping Wheelchair

- Funny sound
- Small efficiency deduction

There should be no death, injury, or serious negative medical consequences.

---

# 18. Help System

Players can ask for assistance.

Button:

**Ask Nurse**

Nurse appears and gives hints.

Examples:

> "Look for the bottle with the flower symbol."

> "Mia needs gauze from the supply shelf."

> "Lucas needs to go to the X-ray room."

Hints may become more explicit after repeated mistakes.

---

# 19. Scoring System

Three primary categories:

## Caring ❤️

Affected by:

- Patient happiness
- Waiting times
- Comfort actions
- Correct treatment

## Doctor Skill 🩺

Affected by:

- Mini-game performance
- Examination accuracy
- Correct item selection
- Procedure completion

## Efficiency ⚡

Affected by:

- Treatment speed
- Route efficiency
- Mistakes
- Extra unnecessary trips

---

# 20. End-of-Level Score

Example:

# Doctor Ayden's Report

❤️ Caring  
★★★

🩺 Doctor Skill  
★★☆

⚡ Efficiency  
★★★

**Final Score: 2,750**

**Overall Rating: ★★★**

Possible celebration:

- Confetti
- Patients clap
- Doctor Ayden victory pose
- Hospital staff cheer

Voice/text:

> "Doctor Ayden saved the day!"

---

# 21. Winning Condition

Default level objective:

> Treat every patient before the clinic closes.

Example:

**Patients Helped**

❤️❤️❤️❤️♡♡

When all patients have been successfully discharged:

**CLINIC COMPLETE**

Alternative level objectives:

- Help 5 patients
- Treat 3 injuries
- Complete 2 procedure-room cases
- Maintain high patient happiness
- Finish morning clinic
- Finish emergency rush

---

# 22. Losing / Failure

Recommended philosophy:

Avoid hard Game Over states during normal gameplay.

Instead:

### Low Score Outcome

Player completes clinic but earns:

★☆☆

Message:

> "Good work! Let's try again and make our patients even happier!"

Possible hard failure only in optional challenge mode.

Example:

Clinic closes before all patients are helped.

Rather than "Game Over":

> "Clinic closed! You helped 5 out of 7 patients."

Options:

- Try Again
- Continue
- Return to Hospital

---

# 23. Level Progression

## Tutorial

Patient count: 1

Teaches:

- Movement
- Talking to patient
- Checkup
- Finding one medicine
- Giving treatment

---

## Level 1 — First Day

Patients: 2

Mechanics:

- Fever medicine
- Thermometer

---

## Level 2 — Achoo!

Patients: 3

Adds:

- Allergy treatment
- Stethoscope

---

## Level 3 — Ouch!

Patients: 3

Adds:

- Scrape
- Antiseptic
- Gauze mini-game

---

## Level 4 — Busy Clinic

Patients: 4

Adds:

- Multiple simultaneous patients
- Happiness system

---

## Level 5 — Wheels Up!

Patients: 4

Adds:

- Wheelchair
- Procedure room

---

## Level 6 — X-Ray Day

Patients: 5

Adds:

- X-ray room
- Positioning mini-game

---

## Level 7+

Introduce:

- Combined conditions
- Faster patient arrivals
- More complicated treatments
- Larger hospital
- Additional rooms

---

# 24. Difficulty Progression

Difficulty should increase through complexity rather than harsh timing.

Variables:

- Number of patients
- Number of simultaneous patients
- Treatment steps
- Similar-looking supplies
- Walking distance
- Patient patience
- Number of rooms
- Number of possible diagnoses

Do not primarily increase difficulty by making mini-game controls significantly harder.

---

# 25. Tutorial System

Tutorial instructions should use:

- Animation
- Arrows
- Highlighting
- Large icons

Avoid long text.

Example:

**Go to Mia**

Animated arrow points to patient.

Then:

**Press E to check Mia**

Then:

**Move the stethoscope here**

Visual target appears.

Tutorial prompts should disappear once understood.

---

# 26. Visual Style

Recommended art style:

- Bright 2D cartoon
- Rounded shapes
- Soft shadows
- Expressive characters
- Clean outlines
- Large readable objects
- Warm hospital environment

Avoid:

- Blood
- Graphic wounds
- Realistic needles
- Realistic surgery
- Scary medical imagery
- Disturbing patient reactions

Small scrapes should resemble simple pink/red cartoon marks.

---

# 27. Hospital Color Design

Each functional area should have distinct environmental cues.

Example:

- Patient Room — soft blue
- Pharmacy — green
- Procedure Room — orange
- X-Ray — purple
- Recovery — yellow

Do not make gameplay dependent exclusively on color.

Each room should also have:

- Icon
- Sign
- Shape language

Example:

**X-RAY**

Large bone icon.

---

# 28. Audio

## Background Music

Style:

- Cheerful
- Calm
- Light
- Playful

Avoid overly frantic music.

---

## Sound Effects

Examples:

- Footsteps
- Door opening
- Item pickup
- Correct answer
- Incorrect answer
- Stethoscope heartbeat
- Thermometer beep
- Bandage wrap
- Wheelchair movement
- Patient laugh
- Patient sneeze
- Sparkle
- Level complete

---

# 29. Patient Dialogue

Dialogue should be short.

Example arrival:

> "Doctor Ayden! My knee hurts!"

After examination:

> "Will it be okay?"

During treatment:

> "That tickles!"

Completion:

> "I feel much better!"

> "Thank you, Doctor Ayden!"

Patient personality should appear primarily through short reactions rather than large dialogue sequences.

---

# 30. Patient Data Structure

Each patient should contain configurable data.

Example conceptual structure:

```text
Patient
- name
- characterSprite
- ageType
- personality
- symptoms[]
- diagnosis
- treatmentSteps[]
- requiredItems[]
- requiredRoom
- patienceLevel
- currentHappiness
- dialogue[]
- reward
```

This allows developers to create many patient scenarios from reusable systems.

---

# 31. Treatment Data Structure

Example:

```text
Treatment
- treatmentName
- treatmentIcon
- requiredItem
- requiredRoom
- miniGameType
- difficulty
- duration
- scoreValue
```

Example:

```text
Treatment: Bandage Knee

Required Items:
- Antiseptic
- Gauze

Room:
- Patient Room

Steps:
1. Clean wound
2. Apply gauze
3. Wrap bandage
```

---

# 32. Medicine System

For standard children's mode, use fictional/simple labels.

Example:

| Icon | Name | Symbol |
|---|---|---|
| 🌡️ | Fever Medicine | Sun |
| 🌼 | Allergy Medicine | Flower |
| 😷 | Cough Medicine | Cloud |
| ⭐ | Pain Medicine | Star |
| 🫃 | Tummy Medicine | Apple |

Color can provide additional differentiation but should not be the only indicator.

Possible real-world mapping may exist internally for educational reference, but should not instruct children to self-medicate.

---

# 33. Patient Queue System

Possible maximum active patients:

### Early Levels
1–2

### Mid Levels
3–4

### Advanced Levels
5–6

Patient states:

```text
ARRIVING
WAITING
READY_FOR_CHECKUP
UNDER_EXAMINATION
WAITING_FOR_TREATMENT
BEING_TRANSPORTED
UNDER_TREATMENT
RECOVERING
READY_FOR_DISCHARGE
DISCHARGED
```

---

# 34. Discharge

Once all treatment steps are completed:

Patient happiness becomes maximum.

Patient performs recovery animation.

Examples:

- Stands up
- Jumps
- Gives thumbs-up
- High-five with Ayden

Message:

**PATIENT READY TO GO HOME!**

Player may optionally walk patient to exit.

Completion reward awarded.

---

# 35. Rewards

Possible rewards:

- Stars
- Coins
- Stickers
- Doctor badges
- Hospital decorations
- Character accessories

Coins should primarily unlock cosmetic content.

Avoid aggressive monetization systems.

---

# 36. Sticker Collection

Each successfully completed level can unlock a sticker.

Examples:

- Stethoscope
- Heart
- Ambulance
- Bandage
- Teddy bear
- X-ray
- Syringe
- Doctor badge

Sticker book provides a child-friendly progression system.

---

# 37. Doctor Ayden Customization

Possible unlockable cosmetics:

- Different sneakers
- Doctor coat patterns
- Scrubs
- Hats
- Glasses
- Stethoscope colors
- Name badges
- Backpack
- Watch

Doctor Ayden should remain clearly recognizable.

---

# 38. Hospital Upgrades

Future progression system.

Possible upgrades:

- More patient beds
- Faster medicine cabinet
- Better wheelchair
- Extra recovery bed
- New treatment room
- New decorations
- Larger pharmacy

Avoid making upgrades mandatory for successful treatment.

---

# 39. Special Events

Future content possibilities:

## Sports Day

Patients arrive with:

- Bruises
- Sprains
- Scrapes

## Allergy Season

More sneezing/allergy patients.

## School Health Day

Many child patients receive checkups.

## Rainy Day

Cold/cough cases.

## Teddy Bear Clinic

Doctor Ayden treats toy animals as a bonus level.

---

# 40. NPC Staff

Possible NPCs:

### Nurse

Provides hints and assistance.

### Receptionist

Introduces patients.

### Pharmacist

Explains medicine storage.

### X-Ray Technician

Introduces X-ray mini-game.

### Cleaner

Creates harmless moving obstacles.

NPCs can help make the hospital feel alive.

---

# 41. Optional Cooperative Mode

Future feature.

Player 1:

Doctor Ayden

Player 2:

Nurse/helper

Players can divide tasks:

- One performs checkups
- One gathers supplies
- Both transport patients

Not required for MVP.

---

# 42. Accessibility

Recommended features:

- No reading required mode
- Icon-heavy interface
- Optional voice narration
- Large UI
- Adjustable game speed
- Disable patient patience timers
- Color-blind-friendly item identification
- Simplified controls
- Reduced animation mode
- Adjustable sound/music independently

---

# 43. Parent Settings

Optional protected menu.

Possible options:

- Difficulty
- Reading level
- Timers on/off
- Needle imagery on/off
- Voice prompts
- Real medicine terminology on/off
- Play session limit
- Music volume
- Sound volume

---

# 44. MVP Scope

The initial playable MVP should focus on proving the gameplay loop.

## MVP Environment

Rooms:

1. Waiting area
2. Patient room
3. Medicine/supply room
4. Procedure room

---

## MVP Character Content

### Doctor Ayden

Full movement and basic interaction animation.

### Patients

Minimum 5 unique patient appearances.

### Nurse

1 helper NPC.

---

## MVP Conditions

Minimum:

1. Fever
2. Allergy/sneezing
3. Scraped knee
4. Bruise
5. Cough
6. Minor arm injury

---

## MVP Treatments

Minimum:

- Temperature check
- Stethoscope check
- Medicine retrieval
- Wound cleaning
- Gauze/bandage
- Ice pack
- Injection/procedure interaction
- Wheelchair transportation

---

## MVP Mini-Games

Minimum four:

1. Stethoscope
2. Thermometer
3. Wound cleaning
4. Bandage wrapping

Optional fifth:

5. Injection

---

## MVP Levels

Recommended:

### Tutorial
1 patient

### Level 1
2 patients

### Level 2
3 patients

### Level 3
3 patients + bandages

### Level 4
4 patients + simultaneous requests

### Level 5
4 patients + wheelchair/procedure room

Total:

**6 playable stages including tutorial**

---

# 45. MVP UI

Required UI:

- Patient symptom bubbles
- Interaction prompt
- Doctor clipboard
- Active patient checklist
- Inventory slots
- Patient happiness
- Clinic progress
- Score
- Pause menu
- Mini-game instructions
- End-of-level report

---

# 46. MVP Game States

Required:

```text
MAIN_MENU
LEVEL_SELECT
LEVEL_LOADING
PLAYING
PAUSED
MINIGAME
LEVEL_COMPLETE
LEVEL_RESULTS
```

---

# 47. Main Menu

Proposed options:

# Doctor Ayden to the Rescue!

**PLAY**

**STICKER BOOK**

**OPTIONS**

Optional:

**DRESS UP**

Doctor Ayden performs idle animation beside title.

---

# 48. Level Select

Possible presentation:

Hospital floor/map.

Rooms unlock gradually.

Example:

- Day 1 ✅
- Day 2 ✅
- Day 3 ⭐⭐☆
- Day 4 🔒

Each level displays best star rating.

---

# 49. Level HUD

Suggested layout:

### Top Left

Current patients:

`❤️ 3 / 5`

### Top Center

Clinic timer/progress.

### Top Right

Score.

### Bottom

Inventory slots.

### Side Button

Clipboard.

When near object:

Large interaction prompt.

---

# 50. Level Completion Screen

Example:

# Clinic Complete!

**Patients Helped:** 5/5

❤️ Caring  
★★★

🩺 Doctor Skill  
★★★

⚡ Efficiency  
★★☆

**Total Score: 3,250**

**Overall: ★★★**

Reward:

**New Sticker Unlocked!**

🩹 Super Bandage

Buttons:

- Next Level
- Replay
- Main Menu

---

# 51. Core Scoring Example

Suggested starting values:

Patient completed:

+500

Correct treatment step:

+100

Perfect mini-game:

+150

Good mini-game:

+100

Patient remains happy:

+100

Incorrect item:

-25

Repeated incorrect item:

-25

Wheelchair collision:

-10

Hints:

No penalty or very small efficiency reduction.

Exact scoring should be tuned through testing.

---

# 52. AI / Patient Behavior

Patients require lightweight scripted AI.

Possible behavior:

```text
Enter hospital
↓
Find assigned seat/bed
↓
Wait
↓
Play symptom animation
↓
Respond when Ayden interacts
↓
Perform examination animation
↓
Wait for treatment
↓
Move into wheelchair if required
↓
Receive treatment
↓
Celebrate
↓
Exit hospital
```

NPC pathfinding should prevent major blocking.

---

# 53. Room Navigation

Doors should be wide.

Corridors should allow:

- Doctor
- Wheelchair
- NPC movement

Avoid tight collision areas.

Important supplies should remain visually accessible.

The player should spend time making decisions and completing treatments, not fighting navigation.

---

# 54. Save System

Save:

- Levels unlocked
- Best score
- Stars earned
- Stickers collected
- Cosmetic unlocks
- Settings

Autosave after each completed level.

---

# 55. Art Asset Requirements

## Doctor Ayden

- Character sprite
- Walk cycles
- Interaction animations
- Wheelchair pushing
- Treatment poses
- Celebration animations

## Patients

At least five base characters.

Each requires:

- Idle
- Walk
- Sit/lie
- Symptom animations
- Happy animation
- Recovery animation

## Environment

- Hospital floor
- Walls
- Doors
- Beds
- Chairs
- Shelves
- Cabinets
- Sink
- Reception desk
- Medical posters
- Procedure equipment
- Wheelchair

## Items

- Stethoscope
- Thermometer
- Medicine bottles
- Gauze
- Bandage
- Antiseptic
- Ice pack
- Syringe
- Gloves
- Clipboard

---

# 56. UI Asset Requirements

- Symptom icons
- Medicine icons
- Treatment icons
- Room icons
- Happiness faces
- Stars
- Checkmarks
- Inventory frame
- Speech bubbles
- Clipboard
- Buttons
- Progress bars
- Mini-game indicators

---

# 57. Audio Asset Requirements

Minimum:

### Music

- Main menu music
- Hospital gameplay loop
- Mini-game variation
- Level-complete jingle

### Sound Effects

Approximately 20–30 basic effects.

---

# 58. Technical Considerations

Game systems should be data-driven.

Developers should avoid hard-coding each patient encounter.

A level should primarily define:

```text
Level
- patientSchedule[]
- availableConditions[]
- difficulty
- clinicDuration
- patientCapacity
- availableRooms[]
```

New patients and treatments should be addable without rewriting core gameplay systems.

---

# 59. Recommended System Architecture

Major gameplay systems:

```text
PlayerController
InteractionSystem
InventorySystem
PatientManager
PatientStateMachine
TreatmentSystem
MiniGameManager
LevelManager
ScoreManager
HappinessSystem
DialogueSystem
RoomManager
SaveSystem
AudioManager
UIManager
```

---

# 60. Content Pipeline

Designers should be able to define a new patient using configuration/data.

Example:

```text
Patient Scenario:
Name: Benny

Symptoms:
- Sneezing
- Itchy eyes

Checkups:
- Temperature
- Stethoscope

Treatment:
- Allergy Medicine

Required Room:
- Patient Room

Difficulty:
- Easy
```

The engine assembles the encounter automatically.

---

# 61. Safety / Medical Presentation

The game should include a simple parent-facing disclaimer:

> Doctor Ayden to the Rescue! is a fictional children's game. Treatments shown in the game are simplified for entertainment and should not be used as real medical advice.

The game should avoid teaching:

- Real medication dosage
- Prescription decisions
- Injection technique
- Drug combinations
- Diagnosis based solely on symptoms

Real medicine names such as paracetamol or cetirizine can potentially appear in an optional educational context, but the main game should preferably use generic treatment categories.

---

# 62. Design Principles

Every gameplay feature should follow these principles.

## 1. The Player Is Helping

Actions should consistently reinforce caring for patients.

## 2. Mistakes Are Recoverable

Children should rarely become stuck.

## 3. Visual Before Text

Icons and animation should explain gameplay whenever possible.

## 4. Short Tasks

Most mini-games should last approximately 5–15 seconds.

## 5. Frequent Positive Feedback

Successful actions should produce:

- Animation
- Sound
- Stars
- Patient reaction

## 6. No Scary Consequences

Patients become happier after treatment.

Failure affects score rather than patient safety.

## 7. Gradual Complexity

Introduce one new mechanic at a time.

---

# 63. Primary Gameplay Example

Patient Mia arrives.

Mia sits on Bed 2.

Speech bubble appears:

`😭 + 🤕🦵`

Doctor Ayden approaches.

Mia:

> "Doctor Ayden! I fell down!"

Player presses interact.

### Examination Mini-Game

Player examines Mia's knee.

Result:

# Scraped Knee

Needed:

- 🧴 Antiseptic
- 🩹 Gauze

Clipboard updates.

Player runs to supply room.

Player finds antiseptic.

Player finds gauze.

Player returns.

### Cleaning Mini-Game

Player wipes marked areas.

**PERFECT!**

+150 Skill

### Bandage Mini-Game

Player places gauze and wraps bandage.

**GREAT!**

+100 Skill

Mia stands.

Mia:

> "Thank you, Doctor Ayden!"

Mia's happiness becomes:

😄

Reward:

+500 Patient Complete

Mia exits hospital.

Next patient arrives.

---

# 64. Wheelchair Gameplay Example

Patient Grandpa Lee has an arm injury.

Initial bubble:

`😣 + 💪`

Examination reveals:

# Arm Check Required

Treatment:

`🧑‍🦽 → X-RAY`

Player finds wheelchair.

Player places wheelchair beside Grandpa Lee.

Interaction:

**Help Patient Into Wheelchair**

Patient sits.

Doctor Ayden pushes wheelchair.

Player navigates to X-ray room.

Wheelchair is parked in marked zone.

### X-Ray Mini-Game

Player aligns arm with silhouette.

X-ray animation plays.

Treatment continues.

Patient returns to recovery room.

After recovery:

> "Much better! Thank you, Doctor Ayden!"

---

# 65. Possible Future Expansion

After MVP, potential additions include:

- Larger hospital
- Emergency department
- Ambulance arrivals
- Eye clinic
- Dental clinic
- Pediatric ward
- Pharmacy
- Laboratory mini-games
- More Doctor Ayden outfits
- Hospital decoration
- Daily challenges
- Cooperative play
- Seasonal events
- Sticker collection
- Achievement badges
- Story campaign

---

# 66. Features Explicitly Outside MVP

Do not include initially:

- Complex surgery
- Realistic medical simulation
- Online multiplayer
- Large open world
- Hundreds of medicines
- Character skill trees
- Advanced hospital economics
- Staff scheduling
- Competitive leaderboard
- Microtransactions
- Complex crafting
- Detailed diagnosis simulation

These can distract from the core experience before the main gameplay loop is proven.

---

# 67. MVP Success Criteria

The MVP is successful if a young player can:

1. Understand that a patient needs help.
2. Approach the patient without instruction from an adult.
3. Perform the checkup.
4. Understand the resulting treatment request.
5. Locate the correct supply.
6. Return to the correct patient.
7. Complete a mini-game.
8. Understand that the patient has recovered.
9. Repeat the process with another patient.
10. Enjoy replaying a level for additional stars.

The central test is:

> Does the player feel like **Doctor Ayden is actually helping patients**, rather than merely completing unrelated mini-games?

If yes, the core design is working.

---

# 68. Recommended Development Priority

## Phase 1 — Core Prototype

Build:

- One hospital room
- Doctor Ayden movement
- One patient
- Patient interaction
- One symptom
- One medicine shelf
- One treatment
- Basic scoring

Goal:

Validate the basic loop.

---

## Phase 2 — Treatment Prototype

Add:

- Clipboard
- Inventory
- 3 conditions
- Stethoscope mini-game
- Bandage mini-game
- Patient happiness

Goal:

Validate repeated treatment gameplay.

---

## Phase 3 — Hospital Gameplay

Add:

- Multiple rooms
- Multiple patients
- Patient queue
- Wheelchair
- Procedure room
- Level objectives

Goal:

Validate time-management gameplay.

---

## Phase 4 — MVP Content

Add:

- 6 conditions
- 5+ patient characters
- 5 levels + tutorial
- Full scoring
- End-level screens
- Save system
- Audio
- Polished art

Goal:

Produce complete playable MVP.

---

# 69. Core MVP Summary

The first release should contain:

- Doctor Ayden as playable character
- Small 2D hospital
- Waiting room
- Patient room
- Supply/medicine room
- Procedure room
- 5+ patient characters
- 6 patient conditions
- Checkup system
- Treatment checklist
- Clipboard
- Inventory
- Medicine retrieval
- Bandage treatment
- Stethoscope examination
- Thermometer examination
- Wheelchair transportation
- Patient happiness
- Patient queue
- Scoring
- 1–3 star level rating
- Tutorial
- 5 standard levels
- Positive patient recovery animations
- Save/progression system

The MVP should take the basic fantasy:

> **"Doctor Ayden, somebody needs your help!"**

and turn it into a repeated, immediately understandable gameplay cycle:

**See → Examine → Decide → Collect → Treat → Celebrate.**
