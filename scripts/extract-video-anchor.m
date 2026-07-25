#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <CoreServices/CoreServices.h>

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc < 4) {
            fprintf(stderr, "Usage: extract-video-anchor <input.mp4> <seconds> <output.jpg>\n");
            return 64;
        }

        NSURL *inputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
        Float64 seconds = atof(argv[2]);
        NSURL *outputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[3]]];

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inputURL options:nil];
        AVAssetImageGenerator *generator =
            [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
        generator.appliesPreferredTrackTransform = YES;
        generator.requestedTimeToleranceBefore = CMTimeMakeWithSeconds(0.05, 600);
        generator.requestedTimeToleranceAfter = CMTimeMakeWithSeconds(0.05, 600);

        NSError *frameError = nil;
        CMTime actualTime = kCMTimeInvalid;
        CGImageRef frame = [generator
            copyCGImageAtTime:CMTimeMakeWithSeconds(seconds, 600)
            actualTime:&actualTime
            error:&frameError];
        if (!frame) {
            fprintf(stderr, "Could not extract frame: %s\n",
                    frameError.localizedDescription.UTF8String);
            return 65;
        }

        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
        CGImageDestinationRef destination = CGImageDestinationCreateWithURL(
            (__bridge CFURLRef)outputURL,
            kUTTypeJPEG,
            1,
            NULL
        );
        if (!destination) {
            fprintf(stderr, "Could not create JPEG destination\n");
            CGImageRelease(frame);
            return 66;
        }

        NSDictionary *properties = @{(__bridge NSString *)kCGImageDestinationLossyCompressionQuality: @0.95};
        CGImageDestinationAddImage(destination, frame, (__bridge CFDictionaryRef)properties);
        BOOL written = CGImageDestinationFinalize(destination);
        CFRelease(destination);
        CGImageRelease(frame);

        if (!written) {
            fprintf(stderr, "Could not write JPEG frame\n");
            return 67;
        }
    }
    return 0;
}
