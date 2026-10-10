async (page) => {
  const root='/Users/m5/Workspaces/apps/prototypes/pull-studio';
  await page.getByRole('button',{name:'Card',exact:true}).click();
  await page.getByRole('button',{name:'Reese · raw',exact:true}).click();
  await page.getByRole('button',{name:/Front image Angel Reese/}).waitFor();
  await page.getByRole('combobox',{name:'Card profile'}).selectOption('tcg');
  await page.getByRole('slider',{name:'Corner radius',exact:true}).fill('4');
  if(await page.getByRole('combobox',{name:'Card profile'}).inputValue()!=='custom')throw new Error('Custom corner update failed');
  await page.getByRole('combobox',{name:'Card profile'}).selectOption('sports');
  await page.getByRole('button',{name:'Scene',exact:true}).click();
  await page.getByRole('combobox',{name:'Motion preset'}).selectOption('spin');
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('8');
  await page.screenshot({path:root+'/output/playwright/columbia-spin-back.png'});
  await page.getByRole('button',{name:'Export',exact:true}).click();
  await page.locator('.export-button').click();
  await page.getByRole('button',{name:'Cancel render'}).waitFor({state:'hidden',timeout:60000});
  const download=page.waitForEvent('download');
  await page.getByRole('link',{name:'Download MP4'}).click();
  await(await download).saveAs(root+'/proofs/columbia-reese-slow-turn.mp4');
  return {profiles:'TCG/custom/sports switch passed',export:'16-second two-sided slow turn'};
}
