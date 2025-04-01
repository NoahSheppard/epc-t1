# PowerShell script to commit and push images in small batches
# Save this as batch-upload.ps1 and run it from your repository folder

$batchSize = 10  # Number of images per batch
$imageTypes = @("*.jpg", "*.png", "*.jpeg", "*.gif")  # Add or remove file types as needed
$imageFolder = "."  # Set to your image folder, use "." for current directory

# Get all image files
$allImages = @()
foreach ($type in $imageTypes) {
    $allImages += Get-ChildItem -Path $imageFolder -Filter $type -Recurse
}

Write-Host "Found $($allImages.Count) images to process"
$totalBatches = [Math]::Ceiling($allImages.Count / $batchSize)
Write-Host "Will process in $totalBatches batches of $batchSize images each"

# Process images in batches
$batchCounter = 1
$fileCounter = 0

while ($fileCounter -lt $allImages.Count) {
    $batchFiles = @()
    $batchEnd = [Math]::Min($fileCounter + $batchSize, $allImages.Count)
    
    Write-Host "Processing batch $batchCounter ($($fileCounter+1) to $batchEnd)..."
    
    # Add files for this batch
    for ($i = $fileCounter; $i -lt $batchEnd; $i++) {
        $file = $allImages[$i].FullName
        git add "$file"
        $batchFiles += $allImages[$i].Name
        Write-Host "  Added: $($allImages[$i].Name)"
    }
    
    # Commit and push this batch
    git commit -m "Add image batch $batchCounter ($($fileCounter+1) to $batchEnd)"
    Write-Host "Pushing batch $batchCounter to remote..."
    git push --set-upstream origin master
    Write-Host "Batch $batchCounter complete"
    
    $fileCounter = $batchEnd
    $batchCounter++
    
    # Optional: Add a small delay between pushes
    Start-Sleep -Seconds 5
}

Write-Host "All images have been processed in $($batchCounter-1) batches"