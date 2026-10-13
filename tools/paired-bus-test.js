'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Compile the production BusDigital implementation against an in-memory wire
// transport. This checks pairing, CCT, readback and limiting without an ESP32.
// The firmware build checks embedded integration; transport timing still needs
// physical device testing.
test('paired RGB+CCT output driver', { timeout: 30000 }, t => {
  const compiler = process.env.CXX || 'g++';
  if (spawnSync(compiler, ['--version']).status !== 0) {
    t.skip('A host C++ compiler is required for the output-driver tests');
    return;
  }
  const root = path.resolve(__dirname, '..');
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  const between = (text, start, end) => {
    const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
    assert.ok(a >= 0 && b > a, `Missing production source boundaries: ${start}`);
    return text.slice(a, b);
  };
  const header = read('wled00/bus_manager.h');
  const source = read('wled00/bus_manager.cpp');
  const wrapper = read('wled00/bus_wrapper.h');
  const declarations = between(header, '//colors.cpp', '\n\nclass BusPwm')
    + between(header, 'struct BusConfig {', '// milliamps used by ESP');
  const methods = between(source, 'static ColorOrderMap _colorOrderMap', '\n\n#ifdef ESP8266');
  const setOrdering = between(wrapper, '    // reorder channels to selected order', '    switch (busType)');
  const getOrdering = between(wrapper, '    // upper nibble contains W swap information\n    uint8_t w = col.W;', '  static void cleanup');
  const fade = between(read('wled00/colors.cpp'), 'uint32_t IRAM_ATTR color_fade', '\n/*');
  const segmentOutput = between(read('wled00/FX.h'), '    inline uint32_t getOutputColor', '    // AI: end');
  const segmentCapabilities = between(read('wled00/FX.h'), '    inline uint8_t  getLightCapabilities()', '    inline void     deactivate()');
  const fastBlend = between(read('wled00/FX_fcn.cpp'), '      // 1D fast path, include CCT', '\n      return;');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wled-paired-test-'));
  try {
    const harness = read('tools/paired-bus-harness.cpp')
      .replace('// @DECLARATIONS@', declarations)
      .replace('// @SET_ORDERING@', setOrdering)
      .replace('// @GET_ORDERING@', getOrdering)
      .replace('// @FADE@', fade)
      .replace('// @SEGMENT_OUTPUT@', segmentOutput)
      .replace('// @SEGMENT_CAPABILITIES@', segmentCapabilities)
      .replace('// @FAST_BLEND@', fastBlend)
      .replace('// @METHODS@', methods);
    const cpp = path.join(temp, 'test.cpp'), exe = path.join(temp, 'test');
    fs.writeFileSync(cpp, harness);
    const build = spawnSync(compiler, ['-std=c++17', '-g', '-O1', '-fsanitize=address,undefined', '-fno-omit-frame-pointer', '-I', path.join(root, 'wled00'), cpp, '-o', exe], { encoding: 'utf8', timeout: 25000 });
    assert.equal(build.status, 0, build.stderr);
    const run = spawnSync(exe, [], { encoding: 'utf8', timeout: 5000 });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Paired output checks passed/);
    t.diagnostic(run.stdout.trim());
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
