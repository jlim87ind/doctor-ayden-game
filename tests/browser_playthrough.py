"""Real browser playthrough. Uses UI controls, never reaches into game state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,argparse

parser=argparse.ArgumentParser()
parser.add_argument('--start',type=int,default=0,choices=range(6))
start=parser.parse_args().start

OUT=Path(__file__).parent/'screenshots'
OUT.mkdir(exist_ok=True)
def hold(page,button,seconds):
 box=button.bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2)
 page.mouse.down();page.wait_for_timeout(seconds*1000);page.mouse.up()

def run_mini(page,title):
 print('  Mini:',title,flush=True)
 if title in ['Temperature time','Cool as a cucumber']:
  hold(page,page.locator('.mini-target').first,2.85)
 elif title=='Listen with your heart':
  for i in range(3):hold(page,page.locator('.mini-target').nth(i),1.5)
 elif title in ['A gentle checkup','A little comfort','A cosy little rest']:
  for i in range(3):page.locator('.mini-target').nth(i).click()
 elif title=='Clean & sparkle':
  for i in range(7):page.locator('.mini-target').nth(i).click()
 elif title=='Wrap it with care':
  for i in range(4):page.locator('.mini-target').nth(i).click()
 elif title=='Match the care card':
  text=page.locator('.mini-area').inner_text()
  choice='Fever medicine' if 'Fever medicine' in text else 'Allergy medicine' if 'Allergy medicine' in text else 'Cough medicine'
  page.get_by_role('button',name=choice,exact=True).click()
  page.get_by_role('button',name='Give medicine on tray').click()
 elif title=='Picture perfect':
  page.get_by_role('slider',name='Align the arm scan').fill('65')
  page.wait_for_timeout(1100)
 else:raise RuntimeError('Unknown mini '+title)
 page.wait_for_timeout(1200)

def play_day(page,index):
 print('PLAY DAY',index,flush=True)
 for step in range(200):
  if page.locator('#next-level').count():
   page.screenshot(path=str(OUT/f'day-{index}-complete.png'),full_page=True)
   print('DAY COMPLETE',index,flush=True)
   return
  if page.locator('#mini-title').count():
   run_mini(page,page.locator('#mini-title').inner_text());continue
  if page.locator('#patient-action').count():
   label=page.locator('#patient-action').inner_text()
   print('  Action:',label,flush=True)
   page.locator('#patient-action').click()
   if 'Get supplies' in label:
    page.locator('#supplies-done').wait_for(timeout=15000)
   elif 'Get the wheelchair' in label:
    page.locator('#toast').filter(has_text='Wheelchair ready!').wait_for(timeout=15000)
   elif 'Help into wheelchair' in label:
    hint=page.locator('.walkhint').inner_text()
    target='recovery' if 'Recovery' in hint else 'procedure'
    page.locator(f'[data-object="{target}"]').click()
    page.locator('#patient-action').wait_for(timeout=15000)
   continue
  if page.locator('#supplies-done').count():
   needed=page.locator('.supply.needed').all()
   for item in needed:
    if 'In bag' not in item.inner_text():
     # Any one patient's items can be fetched on another trip if the bag fills.
     if page.locator('.slot.filled').count()>=3:break
     item.click()
   page.locator('#supplies-done').click()
   continue
  if page.locator('.modal').count():
   page.locator('.modal .close').click();continue
  patients=page.locator('[data-object^="patient-"]')
  if patients.count():
   patients.first.click()
   page.locator('#patient-action').wait_for(timeout=15000)
  else:page.wait_for_timeout(1000)
 raise RuntimeError('Day did not finish')

with sync_playwright() as p:
 browser=p.chromium.launch()
 context=browser.new_context(viewport={'width':1440,'height':1100})
 page=context.new_page();errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append((r.status,r.url)) if r.status>=400 else None)
 page.goto('http://localhost:8765')
 if start:
  page.evaluate('(level)=>localStorage.setItem("doctor-ayden-v1",JSON.stringify({unlocked:level,results:{}}))',start)
  page.reload()
 page.get_by_role('button',name='Let’s play').click()
 page.locator(f'[data-level="{start}"]').click()
 try:
  for index in range(start,6):
   play_day(page,index)
   if index<5:page.locator('#next-level').click()
  page.locator('#next-level').click()
  assert f'{6-start} / 6' in page.locator('.screen-heading').inner_text()
  page.screenshot(path=str(OUT/'sticker-book.png'),full_page=True)
  saved=page.evaluate('JSON.parse(localStorage.getItem("doctor-ayden-v1"))')
  assert saved['unlocked']==5 and len(saved['results'])==6-start
  page.reload();page.get_by_role('button',name='Sticker book').click()
  assert f'{6-start} / 6' in page.locator('.screen-heading').inner_text()
  assert not errors,errors
  assert not failed,failed
  print(json.dumps({'levels_passed':6-start,'console_errors':errors,'failed_requests':failed,'saved_results':saved['results']},indent=2),flush=True)
 except Exception:
  page.screenshot(path=str(OUT/'failure.png'),full_page=True)
  print('ERRORS',errors,'FAILED',failed,flush=True)
  raise
 finally:browser.close()
