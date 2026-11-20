# 0003 — Hermes draft profile

Date: 2026-11-20
Status: active

The marketing engine is governed on `hermes-droplet-cindy` by the Hermes profile `marketingprojectlead`. The older profile `inboundengineprojectlead` is unchanged.

The checkout is `/root/marketing-engine`. The host's GitHub deploy keys cannot read `MCG-Property/marketing-engine`, so this is a copy of the working tree, not a git clone.

OpenRouter model ids for this profile, checked on 2026-11-20:

- Text: `openai/gpt-6-luna`, the newest GPT Luna that is not the Pro or batch variant.
- Still image, only where no authorised photograph exists: `x-ai/grok-imagine-image-2.0`.
- Video and GIF are not used. `video_gen.model` stays on the image model so a video call is rejected instead of using another video model.

The posting brief is `docs/prompts/marketingprojectlead.md`. The live copy is the profile `SOUL.md`.

The profile may draft. It must not publish, send, or enable a kill switch. No cron job was added. No model call was made.

The running gateway multiplexes profiles and does not lend this profile the root OpenRouter credential. Text and image calls stay unavailable until the profile has its own key.
