// services/SlotService.js
const DailySchedule = require('../models/DailySchedule');

// 👇 THIS IS THE FIX: Make sure this array has all 15 slots in it!
const DEFAULT_SLOTS = [
  { time: 900 }, { time: 920 }, { time: 940 },
  { time: 1000 }, { time: 1020 }, { time: 1040 },
  { time: 1100 }, { time: 1120 }, { time: 1140 },
  { time: 1200 }, { time: 1220 }, { time: 1240 },
  { time: 1400 }, { time: 1420 }, { time: 1440 }
];

exports.getOrGenerateSchedule = async (fpsId, dateString) => {
  let schedule = await DailySchedule.findOne({ fps_id: fpsId, date: dateString });

  if (!schedule) {
    console.log(`Generating fresh slots for Store ${fpsId} on ${dateString}...`); // Helpful debug log
    
    schedule = new DailySchedule({
      fps_id: fpsId,
      date: dateString,
      slots: DEFAULT_SLOTS.map(s => ({
        time: s.time,
        booked: 0,
        capacity: 5, 
        isOpen: true
      }))
    });
    await schedule.save();
  }
  return schedule;
};

exports.bookSlot = async (fpsId, dateString, time) => {
  const result = await DailySchedule.updateOne(
    {
      fps_id: fpsId,
      date: dateString,
      "slots.time": Number(time),
      "$expr": { "$lt": ["$slots.booked", "$slots.capacity"] }
    },
    { $inc: { "slots.$.booked": 1 } }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Slot full or unavailable");
  }
  return true;
};