// Deterministic photographic alignment only. No generated or retouched artwork.
// Coordinates were measured from the user's two October 9 source photographs.
import Foundation
import CoreImage
import ImageIO
import UniformTypeIdentifiers
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let ctx = CIContext(options: [.workingColorSpace: CGColorSpace(name: CGColorSpace.sRGB)!])
struct Job { let input: String; let output: String; let corners: [[Double]]; let orientation: Int32 }
let jobs = [
  Job(input:"IMG_1886.png",output:"angel-reese-front.png",corners:[[103.0/1050,190.0/1400],[927.0/1050,191.0/1400],[916.0/1050,1340.0/1400],[97.0/1050,1337.0/1400]],orientation:1),
  Job(input:"IMG_1887.png",output:"angel-reese-back.png",corners:[[148.0/1400,176.0/1050],[1218.0/1400,159.0/1050],[1230.0/1400,916.0/1050],[173.0/1400,941.0/1050]],orientation:6)
]
for job in jobs {
  let directory=root.appendingPathComponent("public/local-card")
  guard let raw=CIImage(contentsOf:root.appendingPathComponent("references/local-card").appendingPathComponent(job.input)) else {fatalError("Image unavailable")}
  let source = job.input == "IMG_1886.png" ? raw.oriented(forExifOrientation:6) : raw
  let size=source.extent.size
  let origin=source.extent.origin
  let filter=CIFilter(name:"CIPerspectiveCorrection")!
  filter.setValue(source,forKey:kCIInputImageKey)
  for (name,point) in zip(["inputTopLeft","inputTopRight","inputBottomRight","inputBottomLeft"],job.corners) {
    filter.setValue(CIVector(x:origin.x+point[0]*size.width,y:origin.y+(1-point[1])*size.height),forKey:name)
  }
  guard let flat=filter.outputImage else {fatalError("Alignment failed")}
  let oriented=flat.oriented(forExifOrientation:job.orientation)
  guard let cg=ctx.createCGImage(oriented,from:oriented.extent,format:.RGBA8,colorSpace:CGColorSpace(name:CGColorSpace.sRGB)!) else {fatalError("Render failed")}
  let dest=CGImageDestinationCreateWithURL(directory.appendingPathComponent(job.output) as CFURL,UTType.png.identifier as CFString,1,nil)!
  CGImageDestinationAddImage(dest,cg,nil)
  guard CGImageDestinationFinalize(dest) else {fatalError("PNG write failed")}
  print("\(job.output): \(cg.width) × \(cg.height)")
}
