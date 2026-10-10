async (page) => {
  const root='/Users/m5/Workspaces/apps/prototypes/pull-studio';
  await page.setViewportSize({width:1440,height:960});
  await page.getByRole('button',{name:'Card',exact:true}).click();
  await page.getByRole('button',{name:'Jordan · graded',exact:true}).click();
  await page.getByRole('button',{name:/Front image Michael Jordan/}).waitFor();
  await page.getByAltText('Front image original artwork').waitFor();
  await page.getByRole('button',{name:'Front',exact:true}).click();
  await page.screenshot({path:root+'/output/playwright/columbia-graded-inspect.png'});
  await page.getByRole('button',{name:'Scene',exact:true}).click();
  if(await page.getByRole('combobox',{name:'Motion preset'}).inputValue()!=='sway')throw new Error('Slab should default to sway');
  if(!await page.locator('option[value="spin"]').evaluate(e=>e.disabled))throw new Error('Full turn should require a reverse');
  await page.getByRole('button',{name:'Brand',exact:true}).click();
  for(const style of ['Spotlight','Diagonal','Paper']){
    await page.getByRole('button',{name:style+' background',exact:true}).click();
    await page.screenshot({path:root+'/output/playwright/columbia-graded-'+style.toLowerCase()+'.png'});
  }
  await page.getByRole('button',{name:'Spotlight background',exact:true}).click();
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('1');
  await page.waitForTimeout(80);
  const first=await page.locator('canvas[aria-label="Cinematic card preview"]').evaluate(c=>c.toDataURL());
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('5');
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('1');
  await page.waitForTimeout(80);
  const again=await page.locator('canvas[aria-label="Cinematic card preview"]').evaluate(c=>c.toDataURL());
  if(first!==again)throw new Error('Non-deterministic film seek');
  await page.getByRole('button',{name:'Save this look',exact:true}).click();
  await page.getByRole('button',{name:'Paper background',exact:true}).click();
  await page.getByRole('button',{name:'Restore scene',exact:true}).click();
  if(await page.getByRole('button',{name:'Spotlight background',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('Restore failed');
  await page.getByRole('button',{name:'Dismiss notification'}).click();
  await page.getByLabel('Upload background image',{exact:true}).setInputFiles(root+'/public/local-card/angel-reese-front.png');
  await page.getByRole('button',{name:'Remove background image',exact:true}).waitFor();
  await page.getByRole('button',{name:'Remove background image',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:root+'/output/playwright/columbia-mobile.png',fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Mobile overflow');
  await page.setViewportSize({width:1440,height:960});
  await page.getByRole('button',{name:'Export',exact:true}).click();
  await page.locator('.export-button').click();
  await page.getByRole('link',{name:'Download MP4'}).waitFor({timeout:60000});
  const download=page.waitForEvent('download');
  await page.getByRole('link',{name:'Download MP4'}).click();
  await(await download).saveAs(root+'/proofs/columbia-jordan-graded.mp4');
  return {slab:'full holder, front-only sway',seek:'pixel-identical',brand:'3 backgrounds, save/restore and photo import passed',mobile:'390px no overflow',export:'columbia-jordan-graded.mp4'};
}
