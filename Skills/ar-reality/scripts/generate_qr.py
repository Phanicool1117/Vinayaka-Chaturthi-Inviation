#!/usr/bin/env python3
"""
Generate a QR code image pointing at a hosted AR Reality page.

Usage:
    python generate_qr.py <url> [output_path]

Requires the `qrcode` package:
    pip install qrcode[pil] --break-system-packages
"""
import sys


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_qr.py <url> [output_path]")
        sys.exit(1)

    url = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "ar_reality_qr.png"

    try:
        import qrcode
    except ImportError:
        print("Missing dependency. Install it with:")
        print("    pip install qrcode[pil] --break-system-packages")
        sys.exit(1)

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    print(f"QR code for {url} saved to {output_path}")


if __name__ == "__main__":
    main()
