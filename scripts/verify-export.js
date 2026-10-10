async (page) => {
  await page.goto('http://127.0.0.1:5199/?archive');
  await page.getByAltText('Front image original artwork').waitFor();
  await page.getByRole('button',{name:'Export',exact:true}).click();
  await page.locator('.export-button').click();
  await page.getByRole('button',{name:'Cancel render',exact:true}).click({timeout:5000});
  await page.getByText('Render cancelled. Your scene is unchanged.',{exact:true}).waitFor({timeout:10000});
  await page.getByRole('button',{name:'Dismiss notification'}).click();
  await page.getByRole('button',{name:'Switch to film preview'}).click();
  const before=await page.locator('canvas[aria-label="Cinematic card preview"]').evaluate(c=>c.toDataURL());
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('1');
  await page.getByRole('slider',{name:'Timeline',exact:true}).fill('7');
  const after=await page.locator('canvas[aria-label="Cinematic card preview"]').evaluate(c=>c.toDataURL());
  if(before!==after)throw new Error('Seeking back to the same timestamp changed the pixels');
  await page.locator('.export-button').click();
  await page.getByRole('link',{name:'Download MP4'}).waitFor({timeout:60000});
  const download=page.waitForEvent('download');
  await page.getByRole('link',{name:'Download MP4'}).click();
  await(await download).saveAs('/Users/m5/Workspaces/apps/prototypes/pull-studio/proofs/pull-studio-hero-reveal.mp4');
  await page.getByRole('button',{name:'Watch film'}).click();
  const video=page.locator('video');await video.evaluate(v=>v.play());await page.waitForTimeout(1300);
  const playback=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,currentTime:v.currentTime,error:v.error?.message??null}));
  if(playback.width!==1080||playback.height!==1920||playback.duration!==8||playback.currentTime<1||playback.error)throw new Error(JSON.stringify(playback));
  await page.getByRole('button',{name:'Close exported film'}).click();
  await page.getByRole('button',{name:'Dismiss notification'}).click();
  // Generate a timestamp reference using the exact renderer module and full output size.
  const pngDownload=page.waitForEvent('download');
  await page.evaluate(async()=>{
    const {Studio}=await import('/src/studio.ts');const {loadAsset,freshCrop,defaultSettings}=await import('/src/model.ts');
    const canvas=document.createElement('canvas'),studio=new Studio(canvas);
    studio.setSize(1080,1920);studio.setInput({front:await loadAsset('/samples/ty-cobb-front.jpg','reference',true),back:null,logo:null,frontCrop:freshCrop(),backCrop:freshCrop(),settings:defaultSettings});
    studio.render(7);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='reference-7s.png';a.click();studio.dispose();
  });
  await(await pngDownload).saveAs('/Users/m5/Workspaces/apps/prototypes/pull-studio/proofs/reference-7s.png');
  await page.setViewportSize({width:1440,height:960});
  await page.screenshot({path:'/Users/m5/Workspaces/apps/prototypes/pull-studio/proofs/film-preview.png'});
  await page.getByRole('button',{name:'Switch to 3D inspect'}).click();
  await page.getByRole('button',{name:'Card',exact:true}).click();
  await page.screenshot({path:'/Users/m5/Workspaces/apps/prototypes/pull-studio/proofs/clean-editor.png'});
  return {cancellation:'passed',seek:'pixel-identical after out-of-order seek',playback};
}
