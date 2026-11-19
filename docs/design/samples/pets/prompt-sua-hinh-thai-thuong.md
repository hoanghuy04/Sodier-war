# Sửa hình thái Thường: tách rõ hàng 1 (đứng yên) và hàng 2 (đi)

Gửi kèm ảnh `<mã>.png` hiện có (hoặc ảnh ghép) làm mẫu để giữ đúng thiết kế con vật. Mỗi lần làm 1 con. Gửi lại dạng **File** PNG 512×256.

## Phần chung (dán sau phần riêng của từng con)

```text
Redraw this pet's NORMAL-FORM sprite sheet using the attached image as the exact design reference (same colours, same accessories, same size, same pixel style, crisp 1-pixel dark navy outline #1b1726, no anti-aliasing, no blur).
SHEET: exactly 512×256 px, 2 rows × 4 frames, every cell exactly 128×128 px, the pet facing RIGHT in a side-ish 3/4 view, centred in each cell, feet on the same baseline 12 px above the cell bottom, same scale in all 8 frames.
ROW 1 = IDLE (standing still, NOT moving forward): frame 1 neutral, frame 2 chest rises (breathing in), frame 3 blink with eyes closed, frame 4 tail or ears move slightly. The feet stay planted in exactly the same place in all 4 frames.
ROW 2 = WALK CYCLE (clearly moving, must look different from row 1 at a glance): a proper 4-frame loop as described below, with the body bobbing up and down 2-3 px between frames, legs (or wings) in clearly different positions in every frame.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, no gradient, no glow, no pink haze, no shadow, no text, no labels, no grid lines.
```

## Phần riêng: hàng 2 (đi) của từng con

| # | Mã | Dán trước phần chung |
|---|---|---|
| 1 | soi-con | `Pet: the grey wolf pup with a red scarf. Row 2 walk: a trot, diagonal legs move together: frame 1 front-left and back-right legs forward, frame 2 legs passing under the body, frame 3 front-right and back-left legs forward, frame 4 passing again; tail bounces, scarf flutters.` |
| 2 | meo-than-tai | `Pet: the golden lucky cat holding a gold coin. Row 2 walk: waddling upright on its hind legs, left foot forward then right foot forward, body tilting left and right, the bell swinging, the coin held up.` |
| 3 | gau-truc | `Pet: the baby panda with a bamboo leaf. Row 2 walk: a slow clumsy four-legged waddle, round body rocking side to side, front paws stepping one after the other, bamboo leaf bobbing in its mouth.` |
| 4 | rua-da | `Pet: the small stone-shell turtle with a blue crystal. Row 2 walk: slow heavy steps, stubby legs clearly stepping (front-left + back-right, then front-right + back-left), head poking forward and back with each step, shell bobbing slightly.` |
| 5 | cao-lua | `Pet: the fox cub with flame-tipped tail and ears. Row 2 walk: a quick light run, legs stretched out in frame 1, gathered under the body in frame 2, stretched again in frame 3, gathered in frame 4; tail flames trail behind.` |
| 6 | dai-bang | `Pet: the young brown and white eagle. Row 2 walk: FLYING, wings fully up in frame 1, half down in frame 2, fully down in frame 3, half up in frame 4, body rising and sinking 3 px with the beats.` |
| 7 | tho-ngoc | `Pet: the white jade rabbit with a moon pendant. Row 2 walk: HOPPING, frame 1 crouched ready, frame 2 pushing off with hind legs stretched, frame 3 in the air ears back, frame 4 landing front paws first.` |
| 8 | lac-da-vang | `Pet: the small golden camel with gold sacks. Row 2 walk: a steady camel pace, both legs on the same side move together (left pair forward, then right pair forward), neck swaying forward and back, the sacks swinging.` |
| 9 | phuong-hoang | `Pet: the baby phoenix chick with a fiery tail. Row 2 walk: FLYING, small wing beats (up, half, down, half), flame tail waving behind, body bobbing 3 px, a few sparks.` |
| 10 | rong-con | `Pet: the baby dragon with small purple wings. Row 2 walk: FLYING low, wings up, half, down, half, tail curling and uncurling, body bobbing 3 px, a tiny puff of smoke in frame 4.` |

Tên file gửi lại: `soi-con.png`, `meo-than-tai.png`, … (theo cột Mã).
