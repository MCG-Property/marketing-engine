# 0003 — Hermes draft profile

Date: 2026-11-20
Status: active

The marketing engine is governed on `hermes-droplet-cindy` by the Hermes profile `marketingprojectlead`. The older profile `inboundengineprojectlead` is unchanged.

The checkout is `/root/marketing-engine`. The host's GitHub deploy keys cannot read `MCG-Property/marketing-engine`, so this is a copy of the working tree, not a git clone.

OpenRouter model ids, taken from the public catalog on 2026-11-20:

- Text: `anthropic/claude-opus-5.5`
- Still image, only where no real photograph exists: `google/gemini-nano-banana-2.1` (Nano Banana 2.1). Its catalog output is image and text.
- Video and GIF: that model does not produce them. `video_gen.model` is set to the same id so a video call is rejected instead of using another video model.

The profile may draft. It must not publish, send, or enable a kill switch. No cron job was added. No model call was made.

The running gateway multiplexes profiles and does not lend this profile the root OpenRouter credential. Text and image calls stay unavailable until the profile has its own key.
