<p align="center">
  <img src="/images/wled_logo_akemi.png">
  <a href="https://github.com/wled-dev/WLED/releases"><img src="https://img.shields.io/github/release/wled-dev/WLED.svg?style=flat-square"></a>
  <a href="https://raw.githubusercontent.com/wled-dev/WLED/main/LICENSE"><img src="https://img.shields.io/github/license/wled-dev/wled?color=blue&style=flat-square"></a>
  <a href="https://wled.discourse.group"><img src="https://img.shields.io/discourse/topics?colorB=blue&label=forum&server=https%3A%2F%2Fwled.discourse.group%2F&style=flat-square"></a>
  <a href="https://discord.gg/QAh7wJHrRM"><img src="https://img.shields.io/discord/473448917040758787.svg?colorB=blue&label=discord&style=flat-square"></a>
  <a href="https://kno.wled.ge"><img src="https://img.shields.io/badge/quick_start-wiki-blue.svg?style=flat-square"></a>
  <a href="https://github.com/Aircoookie/WLED-App"><img src="https://img.shields.io/badge/app-wled-blue.svg?style=flat-square"></a>
  <a href="https://gitpod.io/#https://github.com/wled-dev/WLED"><img src="https://img.shields.io/badge/Gitpod-ready--to--code-blue?style=flat-square&logo=gitpod"></a>
</p>

# Personal fork: paired RGB+CCT floodlights

This fork adds **Paired SK6812 RGB+CCT** (LED type `35`). WLED sees one pixel
per floodlight; the driver sends RGB to physical address `2*n` and tunable white
to address `2*n+1`, using the existing SK6812 transport and color order.

In **Config → LED Preferences**, choose the new type and set **Length to 4**
for four floodlights. Keep **GPIO 16**, **BRG** color order and **Swap: None**
for this installation. The separate **Warm white channel** and **Cool white
channel** selectors default to **Green** and **Blue**. Either can be reassigned
to Red, Green, Blue or W; the two must differ. These channel names refer to the
sliders that controlled the old white-address segment, before wire color ordering.
The existing Swap control is retained, including WW & CW.

The main **Colors** page and each segment's expanded controls now have a
**Channels** selector: **Color only**, **White only**, or **Color + White**.
New segments default to Color only. Disabled channels are cleared in the driver,
including when automatic white calculation is enabled. Controls and reported
capabilities match the selected mode; presets save the selection as `cm` (`0`,
`1`, `2`). The main selector changes all selected segments, and shows Mixed
when their modes differ.

For independent floodlight modes in an animation, create one segment per logical
pixel and choose each segment's Channels mode. For **Solid**, use one segment
from start `0` to stop `4` to control all four together, or select all module
segments before changing the effect and color. White-only animations use their
explicit W component, or derive brightness from RGB when W is zero. Color +
White animations likewise add a white component when their effect supplies only
RGB. **Solid uses the manual white slider**, so its white brightness can be
adjusted independently. The temperature slider controls warm/cool balance.
Use Auto-calculate W from RGB: None and global override Disabled (or None) for
these manual white controls. Brightness limiting scales both addresses without
changing their temperature; logical color readback is retained for effects.

The old `[0,2,4,6,1,3,5,7]` LED map and separate Color/White segments must be
replaced for this output type. Upload
[the identity map](tools/paired-floods/ledmap.json) as `/ledmap.json`, use a single
segment covering logical pixels **0–3** (start `0`, stop `4`), and recreate old
presets that restore the two-segment layout. Skip and Reverse now operate on
whole floodlights. Current per LED is current **per floodlight**; the example
uses 110 mA as a conservative migration from two addresses at 55 mA each, not
a measured electrical rating.

Configuration examples for this installation:

- [Hardware settings](tools/paired-floods/hardware.json): a **partial** configuration
  for `POST /json/cfg` after installing this firmware. It contains no Wi-Fi or
  account settings; do not use it as a full configuration restore file.
- [Identity LED map](tools/paired-floods/ledmap.json): upload using `/edit`, then reboot.
- [Single-segment state](tools/paired-floods/state.json): for `POST /json/state`;
  starts at low brightness with red RGB and white off.

Build only the standard ESP32 target locally:

```sh
npm ci
npm test
npm run build
pio run -e esp32dev
```

The OTA binary is `build_output/release/WLED_17.0.0-devV5_ESP32.bin`.
`npm test` also runs the production output-driver code on the host, using an
in-memory transport and address/undefined-behavior sanitizers when `g++` is
available. It checks channel mapping, RGB-only chases, temperature, readback,
skip/reverse, limiting, channel modes, the 1D segment compositor, and allocation
failures. Length validation runs in the live configuration constructor, and
failure cleanup cannot release a replacement output's GPIO. Only the standard ESP32 firmware
has been built; physical LED behavior still needs testing on the installation.
GitHub Actions are disabled on this personal fork, and no upstream PR is planned.

# Welcome to WLED! ✨

A fast and feature-rich firmware for ESP32 microcontrollers to control addressable LEDs — from simple strips to large 2D matrices and HUB75 panels.

Originally created by [Aircoookie](https://github.com/Aircoookie), now maintained by a community of contributors.

## 🤝 Contributing

Want to help improve WLED? Awesome! Please skim [CONTRIBUTING.md](CONTRIBUTING.md) first - it covers how we like PRs and issues to look, including our take on AI-assisted contributions.
If you're an AI coding agent, [AGENTS.md](AGENTS.md) is for you - please read it before modifying any files. 😊

## ⚙️ Features

### Effects & Visuals
- [**200+ built-in effects**](https://kno.wled.ge/features/effects/) including classic animations, audio-reactive, and 2D/matrix effects
- [50+ color palettes](https://kno.wled.ge/features/palettes/) plus a built-in **custom palette editor** (PixelForge)
- [**2D LED matrix support**](https://kno.wled.ge/advanced/mapping/) with dedicated 2D effects and flexible panel mapping
- [**HUB75 RGB matrix panel support**](https://kno.wled.ge/advanced/HUB75/) (ESP32)
- [**AudioReactive**](https://kno.wled.ge/advanced/audio-reactive/) effects — included by default, responding to sound via microphone, line-in, or network audio source
- Effect blending for smooth transitions between animations
- Antialiased drawing functions for smooth graphics

### Segments & Control
- [**Segments**](https://kno.wled.ge/features/segments/) — apply different effects, colors and palettes to independent parts of your LED setup simultaneously
- Up to **250 presets** to save and recall colors, effects and segment configurations — supports [playlists](https://kno.wled.ge/features/presets/) for automated cycling
- Nightlight function with configurable dimming curve
- Configurable **Auto Brightness Limiter** (per output) for safe operation

### Hardware Support
- **ESP32** (all variants: original, S2, S3, C3)
- [**Up to 17 LED outputs**](https://kno.wled.ge/features/multi-strip/) on ESP32 using parallel I2S + RMT
- [Addressable LED support](https://kno.wled.ge/basics/compatible-led-strips/): WS2812B, WS2811, WS2815, SK6812, WS2805, TM1914, APA102, WS2801, LPD8806, and many more
- RGBW, [RGB+CCT](https://kno.wled.ge/features/cct/) and white-only strips
- PWM outputs for analog LEDs and dimmers
- [**Ethernet** support](https://kno.wled.ge/features/ethernet-lan/) for a wide range of boards (QuinLED, LILYGO, Olimex, and more)
- Filesystem-based config for easy backup and restore of presets and settings
- Full OTA firmware updates (HTTP + ArduinoOTA), password-protectable

### Connectivity & Integrations
- **WLED app** for [Android](https://play.google.com/store/apps/details?id=ca.cgagnier.wlednativeandroid) and [iOS](https://apps.apple.com/gb/app/wled-native/id6446207239)
- [JSON](https://kno.wled.ge/interfaces/json-api/) and [HTTP request](https://kno.wled.ge/interfaces/http-api/) APIs
- **Multi-WiFi** — connect to up to 3 networks with automatic AP fallback
- **ESP-NOW** wireless sync between devices (no WiFi router required)
- [**MQTT**](https://kno.wled.ge/interfaces/mqtt/) with Home Assistant discovery
- [**E1.31, Art-Net**](https://kno.wled.ge/interfaces/e1.31-dmx/), [DDP](https://kno.wled.ge/interfaces/ddp/) and [TPM2.net](https://kno.wled.ge/interfaces/udp-realtime/) for DMX/professional lighting control
- [UDP realtime sync](https://kno.wled.ge/interfaces/udp-notifier/) across multiple WLED devices
- Alexa voice control (on/off, brightness, color)
- [Philips Hue sync](https://kno.wled.ge/interfaces/philips-hue/)
- [diyHue](https://github.com/diyhue/diyHue) and [Hyperion](https://github.com/hyperion-project/hyperion.ng) integration
- [Adalight / TPM2](https://kno.wled.ge/interfaces/serial/) (PC ambilight via serial)
- [Infrared remote control](https://kno.wled.ge/interfaces/infrared/) (24-key RGB, receiver required)
- Timers and schedules (NTP time sync, full timezone and DST support)

### Developer-Friendly
- **Usermod system** — extend WLED with community or custom modules without modifying core code
- Large and active [usermod library](https://kno.wled.ge/advanced/community-usermods/) including AudioReactive, temperature sensors, rotary encoders, displays, and much more
- Well-documented [JSON API](https://kno.wled.ge/interfaces/json-api/)
- Licensed under the **EUPL v1.2**

## 📲 Quick start guide and documentation

See the [documentation at kno.wled.ge](https://kno.wled.ge)!

[Tutorials and getting-started guides](https://kno.wled.ge/basics/tutorials/) to help you get your project running quickly.

## 🖼️ User interface

<img src="/images/macbook-pro-space-gray-on-the-wooden-table.jpg" width="50%"><img src="/images/walking-with-iphone-x.jpg" width="50%">

## 💾 Compatible hardware

See the [compatible hardware list](https://kno.wled.ge/basics/compatible-hardware) on the wiki.

## ✌️ Other

Licensed under the [EUPL v1.2](https://raw.githubusercontent.com/wled-dev/WLED/main/LICENSE).  
Credits to all [contributors](https://kno.wled.ge/about/contributors/)!  
CORS proxy by [Corsfix](https://corsfix.com/).

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/wled/WLED?utm_source=oss&utm_medium=github&utm_campaign=wled%2FWLED&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=PR+Reviews+supported+by+CodeRabbit)

Join the Discord server to discuss everything about WLED!

<a href="https://discord.gg/QAh7wJHrRM"><img src="https://discordapp.com/api/guilds/473448917040758787/widget.png?style=banner2" width="25%"></a>

Check out the WLED [Discourse forum](https://wled.discourse.group)!

If you'd like to reach the original creator privately: [dev.aircoookie@gmail.com](mailto:dev.aircoookie@gmail.com).

If WLED brightens up your day, you can [send a gift to Aircoookie via PayPal](https://paypal.me/aircoookie).

---

*Disclaimer:*

If you are prone to photosensitive epilepsy, we recommend you do **not** use this software.  
If you still want to try, avoid strobe, lightning or noise modes and high effect speed settings.

As per the EUPL license, no liability is assumed for any damage to you or any other person or equipment.
