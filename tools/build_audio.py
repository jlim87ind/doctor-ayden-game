"""Rebuild the bundled spoken prompts using the user's approved Microsoft voice."""
import asyncio
from pathlib import Path
import edge_tts

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'audio'
PHRASES = {
 'welcome': 'Doctor Ayden to the rescue! Let’s help our patients feel better!',
 'good-job': 'Good job, Doctor Ayden! You are a superstar!',
 'amazing': 'Amazing work! High five!',
 'great-care': 'Wow! That was such kind and gentle care!',
 'superstar': 'Woo hoo! You did it! What a great doctor!',
 'well-done': 'Well done! You’re making everyone smile!',
 'all-better': 'All better! Thank you, Doctor Ayden!',
 'complete': 'Hooray! Clinic complete! Doctor Ayden saved the day!',
 'next-patient': 'Let’s help our next patient!',
 'try-again': 'You’ve got this! Let’s try that one more time.',
 'wrong-item': 'Hmm, that’s not the one. Let’s check our care card!',
 'new-patient': 'Doctor Ayden! Someone needs your help!',
 'checkup': 'Let’s check you out!',
 'supplies': 'I know what we need! Let’s visit the supply cupboard!',
 'temperature': 'Put the thermometer on the glowing spot. Hold it still!',
 'listen': 'Hold the stethoscope on each heart. Listen carefully!',
 'inspect': 'Find the three little stars. Let’s have a gentle look!',
 'clean': 'Swipe over the little marks to clean them. Nice and gentle!',
 'bandage': 'Follow the numbers. Drag your bandage from one to the next!',
 'ice': 'Hold the ice pack on the glowing spot. Nice and cool!',
 'medicine': 'Match the picture on the care card. Then give it to your patient!',
 'rest': 'Give some water, a cosy blanket, and a teddy bear!',
 'patch': 'Let’s use our pretend comfort patch. Tap the little stars!',
 'align': 'Slide the pretend scan until the two arms line up!',
 'wheelchair': 'Let’s take a ride! Get the wheelchair, then visit your patient.',
 'procedure': 'Off to the procedure room! Follow the path!',
 'recovery': 'Time for a cosy rest! Let’s go to the recovery corner!',
 'hands': 'Clean hands! Ready to help!',
 'reassure': 'You’re doing great! We’ll look after you.',
 'bag-full': 'Your doctor bag is full. Tap an item in your bag to put it back.',
 'tutorial-patient': 'Hello, Doctor Ayden! Tap Mia’s bed, or walk over and press E.',
 'hint-exam': 'First, tap your patient to start a gentle checkup.',
 'hint-supply': 'Look for the matching picture in the supply cupboard.',
 'hint-patient': 'You have what you need! Go back to your patient.',
 'hint-rest': 'Your patient needs a little rest. Tap them to help!',
 'sticker': 'A new sticker! You earned it!',
 'fever-symptom': 'I feel so warm and sleepy.',
 'allergy-symptom': 'Achoo! My nose is so tickly.',
 'cough-symptom': 'My cough is keeping me awake.',
 'scrape-symptom': 'I fell over while playing.',
 'bruise-symptom': 'Oops! I bumped my knee.',
 'arm-symptom': 'My arm feels a little sore.',
}
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 sem=asyncio.Semaphore(4)
 async def make(key,words):
  target=OUT/f'{key}.mp3'
  if target.exists() and target.stat().st_size>1000:return
  async with sem:
   for retry in range(3):
    try:
     await edge_tts.Communicate(words,'en-US-AriaNeural',rate='+10%').save(str(target))
     print(key,flush=True);return
    except Exception:
     if retry==2:raise
     await asyncio.sleep(1)
 await asyncio.gather(*(make(k,v) for k,v in PHRASES.items()))
if __name__=='__main__':asyncio.run(main())
