#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

static void printUsage(void) {
    fprintf(stderr, "Usage: process-approved-video <input.mp4> <output.mp4> [cropY] [duration] [preset] [scale] [cropX] [maxBytes]\n");
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc < 3) {
            printUsage();
            return 64;
        }

        NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
        CGFloat cropY = argc > 3 ? atof(argv[3]) : 0;
        NSTimeInterval requestedDuration = argc > 4 ? atof(argv[4]) : 4;
        NSString *presetName = argc > 5
            ? [NSString stringWithUTF8String:argv[5]]
            : AVAssetExportPresetHighestQuality;
        CGFloat scale = argc > 6 ? atof(argv[6]) : 1;
        CGFloat cropX = argc > 7 ? atof(argv[7]) : 0;
        long long maxBytes = argc > 8 ? atoll(argv[8]) : 0;

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:inputPath]
                                                options:nil];
        AVAssetTrack *sourceTrack = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
        if (!sourceTrack) {
            fprintf(stderr, "No video track found in %s\n", argv[1]);
            return 65;
        }

        Float64 assetSeconds = CMTimeGetSeconds(asset.duration);
        Float64 outputSeconds = MIN(requestedDuration, assetSeconds);
        CMTimeRange timeRange = CMTimeRangeMake(
            kCMTimeZero,
            CMTimeMakeWithSeconds(outputSeconds, 600)
        );

        AVMutableComposition *composition = [AVMutableComposition composition];
        AVMutableCompositionTrack *videoTrack = [composition
            addMutableTrackWithMediaType:AVMediaTypeVideo
            preferredTrackID:kCMPersistentTrackID_Invalid];
        NSError *insertError = nil;
        if (![videoTrack insertTimeRange:timeRange
                                 ofTrack:sourceTrack
                                  atTime:kCMTimeZero
                                   error:&insertError]) {
            fprintf(stderr, "Could not copy the video track: %s\n",
                    insertError.localizedDescription.UTF8String);
            return 66;
        }

        AVAssetTrack *sourceAudioTrack =
            [[asset tracksWithMediaType:AVMediaTypeAudio] firstObject];
        if (sourceAudioTrack) {
            AVMutableCompositionTrack *audioTrack = [composition
                addMutableTrackWithMediaType:AVMediaTypeAudio
                preferredTrackID:kCMPersistentTrackID_Invalid];
            NSError *audioInsertError = nil;
            if (![audioTrack insertTimeRange:timeRange
                                     ofTrack:sourceAudioTrack
                                      atTime:kCMTimeZero
                                       error:&audioInsertError]) {
                fprintf(stderr, "Could not copy the audio track: %s\n",
                        audioInsertError.localizedDescription.UTF8String);
                return 69;
            }
        }

        AVMutableVideoComposition *videoComposition = [AVMutableVideoComposition videoComposition];
        videoComposition.renderSize = CGSizeMake(720, 900);
        videoComposition.frameDuration = CMTimeMake(1, 24);

        AVMutableVideoCompositionInstruction *instruction =
            [AVMutableVideoCompositionInstruction videoCompositionInstruction];
        instruction.timeRange = timeRange;
        AVMutableVideoCompositionLayerInstruction *layerInstruction =
            [AVMutableVideoCompositionLayerInstruction
                videoCompositionLayerInstructionWithAssetTrack:videoTrack];
        CGAffineTransform cropTransform = CGAffineTransformMake(
            scale,
            0,
            0,
            scale,
            -cropX * scale,
            -cropY * scale
        );
        [layerInstruction setTransform:cropTransform atTime:kCMTimeZero];
        instruction.layerInstructions = @[layerInstruction];
        videoComposition.instructions = @[instruction];

        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
        AVAssetExportSession *exporter = [[AVAssetExportSession alloc]
            initWithAsset:composition
            presetName:presetName];
        if (!exporter) {
            fprintf(stderr, "Could not create the MP4 exporter\n");
            return 67;
        }
        exporter.outputURL = outputURL;
        exporter.outputFileType = AVFileTypeMPEG4;
        exporter.shouldOptimizeForNetworkUse = YES;
        exporter.videoComposition = videoComposition;
        if (maxBytes > 0) {
            exporter.fileLengthLimit = maxBytes;
        }

        dispatch_semaphore_t finished = dispatch_semaphore_create(0);
        [exporter exportAsynchronouslyWithCompletionHandler:^{
            dispatch_semaphore_signal(finished);
        }];
        dispatch_semaphore_wait(finished, DISPATCH_TIME_FOREVER);

        if (exporter.status != AVAssetExportSessionStatusCompleted) {
            fprintf(stderr, "Video export failed: %s\n",
                    exporter.error.localizedDescription.UTF8String);
            return 68;
        }
    }
    return 0;
}
