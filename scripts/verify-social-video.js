async(page)=>{
 const root='/Users/m5/Workspaces/apps/prototypes/pull-studio';
 await page.getByRole('button',{name:'3D cards',exact:true}).click();
 await page.getByRole('button',{name:'Export',exact:true}).click();
 for(const format of ['portrait','square','vertical']){
   await page.getByLabel('Social format').selectOption(format);
   await page.getByRole('button',{name:'Export film',exact:true}).click();
   await page.getByText('Last export ready',{exact:true}).waitFor({timeout:120000});
   await page.getByRole('button',{name:'Export film',exact:true}).waitFor({state:'visible',timeout:120000});
   const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download MP4'}).click();await(await download).saveAs(root+'/output/playwright/social-'+format+'.mp4');
 }
 await page.getByRole('button',{name:'Posts',exact:true}).click();
 console.log('Exported actual MP4 in all three social formats.');
}
