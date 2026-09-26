"""Fetch and encode the openly licensed music, recorded foley, and local font."""
from pathlib import Path
import io,zipfile,urllib.request,subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio'
SOURCE=ROOT/'tools/source'
EFFECTS={'step-1':'footstep_carpet_000','step-2':'footstep_carpet_001','tap':'impactWood_light_000','pickup':'impactWood_light_002','success':'impactGlass_light_000','wipe':'footstep_snow_000','wrap':'footstep_grass_000','wheel':'footstep_wood_000','door':'impactWood_medium_001','water':'impactGlass_light_003','blanket':'impactSoft_medium_001','teddy':'impactSoft_medium_002','heartbeat':'impactSoft_heavy_000','oops':'impactSoft_medium_000','page':'footstep_grass_003','sink':'footstep_snow_004','arrive':'impactBell_heavy_000','pop':'impactGeneric_light_001','sticker-pop':'impactWood_light_004','celebrate':'impactBell_heavy_002','tray':'impactPlate_light_000','chill':'impactGlass_light_004'}

def fetch(url,target):
 if not target.exists():target.write_bytes(urllib.request.urlopen(url,timeout=60).read())
 return target.read_bytes()

def main():
 SOURCE.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
 z=zipfile.ZipFile(io.BytesIO(fetch('https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip',SOURCE/'kenney.zip')))
 z.extractall(SOURCE/'kenney')
 fetch('https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3',SOURCE/'Carefree.mp3')
 for name,original in EFFECTS.items():
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(SOURCE/'kenney/Audio'/(original+'.ogg')),'-af','afade=t=out:st=0.35:d=0.2','-t','0.55','-codec:a','libmp3lame','-q:a','4',str(OUT/(name+'.mp3'))],check=True)
 for name,start,duration in [('menu',0,40),('hospital',40,80),('mini',120,40),('complete',180,8)]:
  subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',str(SOURCE/'Carefree.mp3'),'-t',str(duration),'-af',f'afade=t=in:d=0.3,afade=t=out:st={duration-.5}:d=0.5','-codec:a','libmp3lame','-b:a','128k',str(OUT/f'music-{name}.mp3')],check=True)
 (ROOT/'assets/Kenney-License.txt').write_text((SOURCE/'kenney/License.txt').read_text())
 fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito%5Bwght%5D.ttf',ROOT/'assets/Nunito.ttf')
 fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt',ROOT/'assets/Nunito-OFL.txt')
 print('Music, foley, font, and licenses are ready.')
if __name__=='__main__':main()
