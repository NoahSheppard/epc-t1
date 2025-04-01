setlocal enabledelayedexpansion

set "counter=0"
set "batch=1"
set "batch_size=10"

for %%f in (*.jpg *.png *.jpeg) do (
    git add "%%f"
    set /a counter+=1
    
    if !counter! equ !batch_size! (
        git commit -m "Add batch !batch! of images"
        git push
        set /a batch+=1
        set "counter=0"
    )
)

if !counter! neq 0 (
    git commit -m "Add final batch !batch! of images"
    git push
)