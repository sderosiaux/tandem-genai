#!/usr/bin/env python3
"""Generate realistic avatar images for Tandem personas."""

import base64
import os
import sys
from pathlib import Path

from openai import OpenAI

PERSONAS = [
    {
        "id": "jake-texas",
        "prompt": "Realistic portrait photo of Jake, a 32 year old white American man from Texas. Software developer look. Casual confidence, friendly smile, short brown hair, slight stubble. Wearing a casual tech company t-shirt. Natural lighting, warm tones. Headshot style, professional but approachable. High quality, photorealistic."
    },
    {
        "id": "maria-brazil",
        "prompt": "Realistic portrait photo of Maria, a 28 year old Brazilian woman from Sao Paulo. Art student aesthetic. Warm, enthusiastic expression, big genuine smile. Dark curly hair, olive skin, expressive eyes. Wearing colorful artistic clothing, maybe a paint-stained shirt. Bohemian vibe. Natural lighting. Headshot style, photorealistic."
    },
    {
        "id": "hans-germany",
        "prompt": "Realistic portrait photo of Hans, a 45 year old German man from Munich. Engineering executive look. Reserved, intelligent expression, slight knowing smile. Graying hair, glasses, well-groomed. Wearing a quality button-down shirt, no tie. Cool tones, professional lighting. Headshot style, photorealistic."
    },
    {
        "id": "yuki-japan",
        "prompt": "Realistic portrait photo of Yuki, a 24 year old Japanese woman from Tokyo. UX designer aesthetic. Shy but curious expression, gentle smile. Black hair with subtle highlights, minimal makeup. Wearing a simple, stylish modern outfit. Soft lighting, clean background. Headshot style, photorealistic."
    },
    {
        "id": "james-uk",
        "prompt": "Realistic portrait photo of James, a 55 year old British man from London. Wealthy investor look. Confident, slightly arrogant expression, knowing smirk. Silver hair, well-groomed, distinguished. Wearing an expensive tailored suit, subtle luxury. Sophisticated lighting. Headshot style, photorealistic."
    },
    {
        "id": "sofia-italy",
        "prompt": "Realistic portrait photo of Sofia, a 38 year old Italian woman from Milan. Professional chef look. Passionate, expressive, warm smile. Dark hair pulled back, Mediterranean features. Wearing chef whites or a stylish apron. Kitchen warmth in the background. Headshot style, photorealistic."
    },
]


def generate_with_openai(prompt: str, output_path: str) -> bool:
    """Generate an image using OpenAI gpt-5 with image_generation tool."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model="gpt-5",
        input=prompt,
        tools=[{"type": "image_generation"}],
    )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    for output in response.output:
        if output.type == "image_generation_call":
            image_data = output.result
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(image_data))
            return True

    raise ValueError(f"No image in response: {response}")


def main():
    output_dir = Path(__file__).parent.parent / "public" / "avatars"
    output_dir.mkdir(parents=True, exist_ok=True)

    for persona in PERSONAS:
        output_path = output_dir / f"{persona['id']}.png"
        print(f"\nGenerating {persona['id']}...")
        print(f"Prompt: {persona['prompt'][:80]}...")

        try:
            if generate_with_openai(persona["prompt"], str(output_path)):
                print(f"Saved: {output_path}")
        except Exception as e:
            print(f"Error generating {persona['id']}: {e}")
            sys.exit(1)

    print("\nDone! All avatars generated.")


if __name__ == "__main__":
    main()
