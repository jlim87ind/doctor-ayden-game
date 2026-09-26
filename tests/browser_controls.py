"""Focused regression checks for controls, audio, pause, mistakes and mobile."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,subprocess

OUT=Path(__file__).parent/'screenshots'
with sync_playwright() as p:
 b=p.chromium.launch()
 page=b.new_page(viewport={'width':1280,'height':1000})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('''window.__media=[]; const NativeAudio=window.Audio; window.Audio=function(...args){const a=new NativeAudio(...args);window.__media.push(a);return a;};''')
 page.goto('http://localhost:8765')
 page.get_by_role('button',name='Let’s play').click();page.locator('[data-level="0"]').click()
 # Keyboard navigation from reception, through the doorway, to bed one.
 page.keyboard.down('ArrowUp');page.wait_for_timeout(600);page.keyboard.up('ArrowUp')
 page.keyboard.down('ArrowLeft');page.wait_for_timeout(1200);page.keyboard.up('ArrowLeft')
 page.keyboard.press('e');page.locator('#patient-action').wait_for()
 page.locator('#patient-action').click()
 target=page.locator('.mini-target').first;target.focus()
 page.keyboard.down('Space');page.wait_for_timeout(500);page.keyboard.up('Space')
 assert page.locator('#mini-title').count()==1
 page.keyboard.press('Escape')
 assert page.locator('.slot.filled').count()==0
 # Pause clock while reading settings. Enable the optional timer.
 page.get_by_role('button',name='Settings',exact=True).click()
 page.locator('#opt-patience').check();page.locator('#options-done').click()
 page.wait_for_timeout(1100);page.get_by_role('button',name='Pause game').click()
 time_before=page.locator('#clinic-time').inner_text();page.wait_for_timeout(1400)
 assert page.locator('#clinic-time').inner_text()==time_before
 page.locator('#resume').click()
 # Finish the checkup with keyboard holding.
 page.locator('[data-object="patient-0"]').click();page.locator('#patient-action').click()
 page.locator('.mini-target').first.focus();page.keyboard.down('Space');page.wait_for_timeout(2850);page.keyboard.up('Space');page.wait_for_timeout(1100)
 page.locator('#patient-action').click();page.locator('#supplies-done').wait_for(timeout=15000)
 page.locator('[data-item="fever"]').click();page.locator('[data-item="toy"]').click();page.locator('[data-item="water"]').click()
 page.locator('[data-item="allergy"]').click();assert page.locator('.slot.filled').count()==3
 page.locator('#supplies-done').click()
 # Return unneeded supplies, then verify wrong medicine cannot be administered.
 page.locator('[data-slot="2"]').click();page.locator('[data-slot="1"]').click();assert page.locator('.slot.filled').count()==1
 page.locator('[data-object="patient-0"]').click();page.locator('#patient-action').wait_for(timeout=15000);page.locator('#patient-action').click()
 page.get_by_role('button',name='Allergy medicine',exact=True).click();page.get_by_role('button',name='Give medicine on tray').click()
 assert page.locator('.mini-target.done').count()==0
 page.get_by_role('button',name='Fever medicine',exact=True).click();page.get_by_role('button',name='Give medicine on tray').click();page.wait_for_timeout(1300)
 assert page.locator('.slot.filled').count()==0
 page.locator('.modal .close').click()
 page.get_by_role('button',name='Settings',exact=True).click();page.locator('#opt-music').fill('0.15');page.locator('#test-voice').click();page.wait_for_timeout(500)
 media=page.evaluate('window.__media.filter(a=>!a.paused).map(a=>({url:a.src,volume:a.volume,ready:a.readyState,error:a.error?.message}))')
 assert any('good-job.mp3' in a['url'] and a['ready']>=2 for a in media),media
 assert any('music-' in a['url'] and a['volume']<.15 for a in media),media
 page.locator('#options-done').click();page.get_by_role('button',name='Mute sound').click()
 assert page.evaluate('window.__media.filter(a=>!a.paused).every(a=>a.volume===0)')
 page.reload();assert page.get_by_role('button',name='Unmute sound').count()==1
 assert page.evaluate('JSON.parse(localStorage.getItem("doctor-ayden-v1")).settings.music')==.15
 print('Keyboard, hold/cancel, pause, full bag, returns, wrong medicine, audio ducking/mute, and settings save PASS',flush=True)
 # Touch and camera movement at phone size.
 phone=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
 phone.on('pageerror',lambda e:errors.append(str(e)))
 phone.goto('http://localhost:8765');phone.get_by_role('button',name='Let’s play').tap();phone.locator('[data-level="0"]').tap();phone.wait_for_timeout(600)
 assert not phone.evaluate('document.documentElement.scrollWidth>innerWidth')
 # The thumb pad is off by default (tap-to-walk). Turn it on in Settings.
 assert not phone.locator('#joystick').is_visible()
 phone.get_by_role('button',name='Settings',exact=True).tap();phone.locator('#opt-joystick').check();phone.locator('#options-done').tap()
 assert phone.locator('#joystick').is_visible()
 left_before=phone.locator('[data-object="patient-0"]').evaluate('(e)=>parseFloat(e.style.left)')
 joy=phone.locator('#joystick').bounding_box();cdp=phone.context.new_cdp_session(phone)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':joy['x']+joy['width']-6,'y':joy['y']+joy['height']/2}]})
 phone.wait_for_timeout(850);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});phone.wait_for_timeout(200)
 left_after=phone.locator('[data-object="patient-0"]').evaluate('(e)=>parseFloat(e.style.left)')
 assert left_after<left_before-5,(left_before,left_after)
 phone.get_by_role('button',name='Patients',exact=False).tap();phone.screenshot(path=str(OUT/'clipboard-phone-verified.png'),full_page=True)
 phone.locator('.modal .close').tap();phone.screenshot(path=str(OUT/'game-phone-verified.png'),full_page=True)
 print('Phone touch joystick, follow camera, clipboard and layout PASS',flush=True)
 assert not errors,errors
 b.close()

# Confirm every bundled MP3 is decodable and has a non-zero duration.
files=list((Path(__file__).parents[1]/'assets/audio').glob('*.mp3'))
for f in files:
 data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(f)]))
 assert float(data['format']['duration'])>.05,f
print(f'{len(files)} bundled MP3 files decode successfully',flush=True)
