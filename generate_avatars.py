#!/usr/bin/env python3
import struct
import zlib
import os

def create_png(width, height, pixel_data):
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    raw_data = b''
    for row in pixel_data:
        raw_data += b'\x00' + row
    compressed = zlib.compress(raw_data)
    idat = make_chunk(b'IDAT', compressed)

    iend = make_chunk(b'IEND', b'')

    return b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend

def draw_pixel(px, r, g, b):
    return struct.pack('BBB', r, g, b)

def draw_rect(px, x1, y1, x2, y2, r, g, b, width, height):
    for y in range(max(0, y1), min(height, y2 + 1)):
        for x in range(max(0, x1), min(width, x2 + 1)):
            idx = (y * width + x) * 3
            px[idx] = r
            px[idx + 1] = g
            px[idx + 2] = b

def draw_circle(px, cx, cy, radius, r, g, b, width, height):
    for y in range(max(0, cy - radius), min(height, cy + radius + 1)):
        for x in range(max(0, cx - radius), min(width, cx + radius + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2:
                idx = (y * width + x) * 3
                px[idx] = r
                px[idx + 1] = g
                px[idx + 2] = b

def draw_ellipse(px, cx, cy, rx, ry, r, g, b, width, height):
    for y in range(max(0, cy - ry), min(height, cy + ry + 1)):
        for x in range(max(0, cx - rx), min(width, cx + rx + 1)):
            if ((x - cx) / max(rx, 1)) ** 2 + ((y - cy) / max(ry, 1)) ** 2 <= 1:
                idx = (y * width + x) * 3
                px[idx] = r
                px[idx + 1] = g
                px[idx + 2] = b

def generate_avatar(output_path, body_color, eye_style, mouth_style, bg_color, has_hat=False, hat_color=None):
    W, H = 64, 64
    pixels = bytearray(W * H * 3)
    for i in range(0, len(pixels), 3):
        pixels[i] = bg_color[0]
        pixels[i + 1] = bg_color[1]
        pixels[i + 2] = bg_color[2]

    cr, cg, cb = body_color
    br, bg_val, bb = body_color
    br = min(255, br + 30)
    bg_val = min(255, bg_val + 30)
    bb = min(255, bb + 30)
    dark = (max(0, br - 50), max(0, bg_val - 50), max(0, bb - 50))

    draw_ellipse(pixels, 32, 38, 20, 18, cr, cg, cb, W, H)

    draw_rect(pixels, 20, 55, 44, 63, cr, cg, cb, W, H)

    draw_rect(pixels, 22, 57, 28, 63, dark[0], dark[1], dark[2], W, H)
    draw_rect(pixels, 36, 57, 42, 63, dark[0], dark[1], dark[2], W, H)

    draw_circle(pixels, 24, 60, 2, br, bg_val, bb, W, H)
    draw_circle(pixels, 40, 60, 2, br, bg_val, bb, W, H)

    if has_hat:
        hr, hg, hb = hat_color
        draw_rect(pixels, 18, 18, 46, 24, hr, hg, hb, W, H)
        draw_rect(pixels, 24, 10, 40, 20, hr, hg, hb, W, H)

    if eye_style == 'happy':
        draw_rect(pixels, 24, 30, 28, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 36, 30, 40, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 25, 31, 27, 32, 30, 30, 30, W, H)
        draw_rect(pixels, 37, 31, 39, 32, 30, 30, 30, W, H)
    elif eye_style == 'wink':
        draw_rect(pixels, 24, 30, 28, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 25, 31, 27, 32, 30, 30, 30, W, H)
        draw_rect(pixels, 36, 31, 40, 32, 30, 30, 30, W, H)
    elif eye_style == 'surprised':
        draw_circle(pixels, 26, 31, 4, 255, 255, 255, W, H)
        draw_circle(pixels, 38, 31, 4, 255, 255, 255, W, H)
        draw_circle(pixels, 26, 31, 2, 30, 30, 30, W, H)
        draw_circle(pixels, 38, 31, 2, 30, 30, 30, W, H)
    elif eye_style == 'angry':
        draw_rect(pixels, 23, 29, 29, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 35, 29, 41, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 25, 31, 27, 32, 30, 30, 30, W, H)
        draw_rect(pixels, 37, 31, 39, 32, 30, 30, 30, W, H)
        draw_rect(pixels, 23, 28, 29, 29, 30, 30, 30, W, H)
        draw_rect(pixels, 35, 28, 41, 29, 30, 30, 30, W, H)
    elif eye_style == 'sleepy':
        draw_rect(pixels, 24, 31, 28, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 36, 31, 40, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 24, 32, 28, 33, 30, 30, 30, W, H)
        draw_rect(pixels, 36, 32, 40, 33, 30, 30, 30, W, H)
    else:
        draw_rect(pixels, 24, 30, 28, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 36, 30, 40, 33, 255, 255, 255, W, H)
        draw_rect(pixels, 25, 31, 27, 32, 30, 30, 30, W, H)
        draw_rect(pixels, 37, 31, 39, 32, 30, 30, 30, W, H)

    if mouth_style == 'smile':
        draw_rect(pixels, 28, 40, 36, 42, 255, 255, 255, W, H)
        draw_rect(pixels, 29, 41, 35, 43, 255, 255, 255, W, H)
        draw_rect(pixels, 30, 40, 34, 41, 200, 100, 100, W, H)
    elif mouth_style == 'grin':
        draw_rect(pixels, 26, 39, 38, 43, 255, 255, 255, W, H)
        draw_rect(pixels, 27, 40, 37, 42, 200, 100, 100, W, H)
    elif mouth_style == 'open':
        draw_ellipse(pixels, 32, 42, 4, 3, 200, 100, 100, W, H)
        draw_ellipse(pixels, 32, 42, 3, 2, 150, 60, 60, W, H)
    elif mouth_style == 'flat':
        draw_rect(pixels, 28, 41, 36, 42, 200, 100, 100, W, H)
    elif mouth_style == 'frown':
        draw_rect(pixels, 28, 43, 36, 44, 200, 100, 100, W, H)
        draw_rect(pixels, 29, 42, 35, 43, 200, 100, 100, W, H)
    elif mouth_style == 'cat':
        draw_rect(pixels, 30, 40, 34, 42, 200, 100, 100, W, H)
        draw_rect(pixels, 28, 42, 30, 43, 200, 100, 100, W, H)
        draw_rect(pixels, 34, 42, 36, 43, 200, 100, 100, W, H)
    else:
        draw_rect(pixels, 28, 40, 36, 42, 200, 100, 100, W, H)

    row_data = []
    for y in range(H):
        row = bytes(pixels[y * W * 3:(y + 1) * W * 3])
        row_data.append(row)

    png = create_png(W, H, row_data)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png)

def generate_splash(output_path):
    W, H = 1080, 1920
    pixels = bytearray(W * H * 3)

    for y in range(H):
        t = y / H
        r = int(108 + (78 - 108) * t)
        g = int(99 + (205 - 99) * t)
        b = int(255 + (196 - 255) * t)
        row_start = y * W * 3
        for x in range(W):
            pixels[row_start + x * 3] = r
            pixels[row_start + x * 3 + 1] = g
            pixels[row_start + x * 3 + 2] = b

    def draw_large_circle(px, cx, cy, radius, r, g, b, width, height):
        for y in range(max(0, cy - radius), min(height, cy + radius + 1)):
            for x in range(max(0, cx - radius), min(width, cx + radius + 1)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2:
                    idx = (y * width + x) * 3
                    px[idx] = r
                    px[idx + 1] = g
                    px[idx + 2] = b

    def draw_large_rect(px, x1, y1, x2, y2, r, g, b, width, height):
        for y in range(max(0, y1), min(height, y2 + 1)):
            for x in range(max(0, x1), min(width, x2 + 1)):
                idx = (y * width + x) * 3
                px[idx] = r
                px[idx + 1] = g
                px[idx + 2] = b

    for cx, cy in [(150, 300), (930, 500), (200, 1400), (880, 1600)]:
        draw_large_circle(pixels, cx, cy, 80, 255, 255, 255, W, H)

    icon_w, icon_h = 200, 180
    icon_x, icon_y = (W - icon_w) // 2, 400
    draw_large_rect(pixels, icon_x, icon_y, icon_x + icon_w, icon_y + icon_h, 255, 255, 255, W, H)
    draw_large_rect(pixels, icon_x + 10, icon_y + 10, icon_x + icon_w - 10, icon_y + icon_h - 10, 180, 180, 180, W, H)

    btn_w, btn_h = 300, 70
    btn_x, btn_y = (W - btn_w) // 2, 1200
    draw_large_rect(pixels, btn_x, btn_y, btn_x + btn_w, btn_y + btn_h, 255, 255, 255, W, H)
    draw_large_rect(pixels, btn_x + 10, btn_y + 10, btn_x + btn_w - 10, btn_y + btn_h - 10, 220, 220, 220, W, H)

    row_data = []
    for y in range(H):
        row = bytes(pixels[y * W * 3:(y + 1) * W * 3])
        row_data.append(row)

    png = create_png(W, H, row_data)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png)

def generate_thumbnail(src_path, dst_path):
    with open(src_path, 'rb') as f:
        data = f.read()

    import io
    def read_chunk(f):
        length = struct.unpack('>I', f.read(4))[0]
        chunk_type = f.read(4)
        chunk_data = f.read(length)
        crc = struct.unpack('>I', f.read(4))[0]
        return chunk_type, chunk_data

    f = io.BytesIO(data)
    sig = f.read(8)
    ihdr_type, ihdr_data = read_chunk(f)
    width, height = struct.unpack('>II', ihdr_data[:8])
    bits, color_type = struct.unpack('BB', ihdr_data[8:10])

    compressed_data = b''
    while True:
        ct, cd = read_chunk(f)
        if ct == b'IDAT':
            compressed_data += cd
        elif ct == b'IEND':
            break

    raw_data = zlib.decompress(compressed_data)
    pixels = []
    stride = 1 + width * 3
    for y in range(height):
        row_start = y * stride + 1
        row = raw_data[row_start:row_start + width * 3]
        pixels.append(row)

    TW, TH = 32, 32
    thumb_pixels = []
    for ty in range(TH):
        sy = int(ty * height / TH)
        row = bytearray()
        for tx in range(TW):
            sx = int(tx * width / TW)
            idx = sx * 3
            row += bytes(pixels[sy][idx:idx + 3])
        thumb_pixels.append(bytes(row))

    png = create_png(TW, TH, thumb_pixels)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, 'wb') as f:
        f.write(png)

avatar_configs = [
    ((108, 99, 255), 'happy', 'smile', (240, 240, 255), False, None),
    ((78, 205, 196), 'wink', 'grin', (235, 250, 248), False, None),
    ((255, 159, 67), 'surprised', 'open', (255, 245, 235), True, (108, 99, 255)),
    ((231, 76, 60), 'angry', 'frown', (255, 240, 240), False, None),
    ((46, 204, 113), 'happy', 'cat', (235, 250, 240), False, None),
    ((155, 89, 182), 'sleepy', 'flat', (245, 235, 250), True, (231, 76, 60)),
    ((241, 196, 15), 'happy', 'smile', (255, 250, 235), False, None),
    ((52, 152, 219), 'wink', 'grin', (235, 245, 255), False, None),
    ((230, 126, 34), 'surprised', 'open', (255, 245, 240), True, (52, 152, 219)),
    ((26, 188, 156), 'happy', 'smile', (235, 250, 248), False, None),
    ((192, 57, 43), 'angry', 'frown', (255, 235, 235), False, None),
    ((142, 68, 173), 'wink', 'cat', (245, 235, 250), True, (241, 196, 15)),
    ((39, 174, 96), 'sleepy', 'flat', (235, 250, 240), False, None),
    ((41, 128, 185), 'happy', 'grin', (235, 245, 255), False, None),
    ((231, 76, 60), 'surprised', 'open', (255, 240, 240), True, (39, 174, 96)),
]

avatar_dir = '/data/data/com.termux/files/home/partystation-clone/player-app/public/avatars'
thumbnail_dir = '/data/data/com.termux/files/home/partystation-clone/host-app/android/app/src/main/res/drawable'

for i, config in enumerate(avatar_configs, 1):
    body, eye, mouth, bg, hat, hat_color = config
    avatar_path = f'{avatar_dir}/avatar{i}.png'
    generate_avatar(avatar_path, body, eye, mouth, bg, hat, hat_color)
    print(f'Created {avatar_path}')

splash_path = '/data/data/com.termux/files/home/partystation-clone/host-app/android/app/src/main/res/drawable/splash.png'
generate_splash(splash_path)
print(f'Created {splash_path}')

for i in range(1, 16):
    src = f'{avatar_dir}/avatar{i}.png'
    dst = f'{thumbnail_dir}/avatar_{i:02d}.png'
    generate_thumbnail(src, dst)
    print(f'Created {dst}')

print(f'\nTotal: 15 avatars + 1 splash + 15 thumbnails = 31 images')
