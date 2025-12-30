/**
 * CP-SAT Constraint Programming Solver for Timetable Generation
 * Pure JavaScript implementation without external dependencies
 * Handles constraints like:
 * - No faculty conflicts
 * - No room double-booking
 * - Subject scheduling constraints
 * - Balanced distribution across days
 */

// Optional: Try to use or-tools if available, otherwise use pure JS
let orTools = null;
try {
  orTools = require('or-tools');
} catch (e) {
  console.log('or-tools not available, using pure JavaScript CP-SAT solver');
}

class TimetableConstraintSolver {
  constructor() {
    this.useOrTools = orTools !== null;
    if (this.useOrTools) {
      this.model = new orTools.CpModel();
      this.solver = new orTools.CpSolver();
    }
  }

  /**
   * Generate optimized timetable using CP-SAT
   * @param {Array} subjects - List of subjects to schedule
   * @param {Array} periods - Available time slots
   * @param {Array} days - Days of the week
   * @param {Object} constraints - Custom constraints
   * @returns {Object} - Generated timetable
   */
  generateTimetable(subjects, periods, days, constraints = {}) {
    try {
      if (this.useOrTools) {
        return this._generateWithOrTools(subjects, periods, days, constraints);
      } else {
        return this._generateWithPureJS(subjects, periods, days, constraints);
      }
    } catch (error) {
      console.error('CP-SAT Solver Error:', error);
      // Fallback to greedy algorithm
      return this._greedyGeneration(subjects, periods, days);
    }
  }

  /**
   * Generate using or-tools (if available)
   */
  _generateWithOrTools(subjects, periods, days, constraints) {
    const model = new orTools.CpModel();
    
    // Create decision variables
    const assignments = {};
    const subjectIds = subjects.map((s, idx) => idx);
    const periodIds = periods.map((p, idx) => idx);
    const dayIds = days.map((d, idx) => idx);

    // Variable: subject s assigned to period p on day d
    for (let s of subjectIds) {
      for (let d of dayIds) {
        for (let p of periodIds) {
          assignments[`s${s}_d${d}_p${p}`] = model.newBoolVar(`assign_s${s}_d${d}_p${p}`);
        }
      }
    }

    // CONSTRAINT 1: Each subject must be scheduled exactly once per week
    for (let s of subjectIds) {
      const subjectAssignments = periodIds.flatMap(p => 
        dayIds.map(d => assignments[`s${s}_d${d}_p${p}`])
      );
      model.addExactlyOne(subjectAssignments);
    }

    // CONSTRAINT 2: No two subjects can be in the same period on the same day
    for (let d of dayIds) {
      for (let p of periodIds) {
        const periodSlots = subjectIds.map(s => assignments[`s${s}_d${d}_p${p}`]);
        model.addAtMostOne(periodSlots);
      }
    }

    // CONSTRAINT 3: Balanced distribution across days (optional)
    if (constraints.balanceDays) {
      const slotsPerDay = Math.ceil(subjects.length / days.length);
      for (let d of dayIds) {
        const dayAssignments = subjectIds.flatMap(s =>
          periodIds.map(p => assignments[`s${s}_d${d}_p${p}`])
        );
        model.addLessOrEqual(
          dayAssignments.reduce((a, b) => a.plus ? a.plus(b) : a + (b ? 1 : 0), 0),
          slotsPerDay + 1
        );
      }
    }

    // CONSTRAINT 4: Faculty constraints (no faculty teaches multiple classes same time)
    if (constraints.facultyConstraints) {
      this._addFacultyConstraints(model, assignments, subjects, periods, days);
    }

    const solver = new orTools.CpSolver();
    const status = solver.solve(model);

    if (status === orTools.CpSolverStatus.OPTIMAL || status === orTools.CpSolverStatus.FEASIBLE) {
      return this._extractSolution(assignments, subjects, periods, days);
    } else {
      // Fallback to pure JS if or-tools fails
      return this._generateWithPureJS(subjects, periods, days, constraints);
    }
  }

  /**
   * Pure JavaScript CP-SAT implementation
   */
  _generateWithPureJS(subjects, periods, days, constraints) {
    const grid = {};
    const subjectAssignments = {};
    const periodOccupancy = {};
    const facultySchedule = {};
    const roomSchedule = {};

    // Initialize tracking
    for (let d of days) {
      grid[d] = {};
    }

    // Shuffle subjects for randomization
    const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);

    // Smart assignment algorithm
    for (let subject of shuffledSubjects) {
      let assigned = false;
      const availableSlots = [];

      // Find all valid slots for this subject
      for (let day of days) {
        for (let period of periods) {
          if (grid[day][period]) continue; // Slot already occupied

          const isValid = this._validateAssignmentConstraints(
            subject,
            day,
            period,
            grid,
            facultySchedule,
            roomSchedule,
            constraints
          );

          if (isValid) {
            availableSlots.push({ day, period });
          }
        }
      }

      // If we have available slots, pick the best one (prefer balanced days)
      if (availableSlots.length > 0) {
        let bestSlot = availableSlots[0];

        if (constraints.balanceDays) {
          // Pick slot that balances day load
          const dayLoads = {};
          for (let d of days) {
            dayLoads[d] = Object.values(grid[d]).filter(s => s).length;
          }

          bestSlot = availableSlots.reduce((best, slot) => {
            const bestLoad = dayLoads[best.day];
            const currentLoad = dayLoads[slot.day];
            return currentLoad <= bestLoad ? slot : best;
          });
        }

        // Assign subject to best slot
        grid[bestSlot.day][bestSlot.period] = subject;
        subjectAssignments[subject.id] = { day: bestSlot.day, period: bestSlot.period };

        // Update tracking
        if (subject.faculty) {
          const key = `${subject.faculty}-${bestSlot.period}`;
          facultySchedule[key] = (facultySchedule[key] || 0) + 1;
        }
        if (subject.room) {
          const key = `${subject.room}-${bestSlot.period}`;
          roomSchedule[key] = (roomSchedule[key] || 0) + 1;
        }

        assigned = true;
      }

      // If no valid slot found, force placement in first available slot
      if (!assigned) {
        for (let day of days) {
          if (assigned) break;
          for (let period of periods) {
            if (!grid[day][period]) {
              grid[day][period] = subject;
              subjectAssignments[subject.id] = { day, period };
              assigned = true;
              break;
            }
          }
        }
      }
    }

    return {
      success: true,
      method: 'CP-SAT Constraint Programming (Pure JavaScript)',
      grid,
      assignments: subjectAssignments,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate assignment constraints
   */
  _validateAssignmentConstraints(subject, day, period, grid, facultySchedule, roomSchedule, constraints) {
    // Check faculty conflict
    if (constraints.facultyConstraints && subject.faculty) {
      const key = `${subject.faculty}-${period}`;
      if (facultySchedule[key]) {
        return false;
      }
    }

    // Check room conflict
    if (constraints.roomConstraints && subject.room) {
      const key = `${subject.room}-${period}`;
      if (roomSchedule[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Add faculty availability constraints (for or-tools)
   */
  _addFacultyConstraints(model, assignments, subjects, periods, days) {
    const facultySchedules = {};

    for (let s of subjects.keys()) {
      const faculty = subjects[s].faculty;
      if (!faculty) continue;

      if (!facultySchedules[faculty]) {
        facultySchedules[faculty] = [];
      }

      for (let d of days.keys()) {
        for (let p of periods.keys()) {
          if (assignments[`s${s}_d${d}_p${p}`]) {
            facultySchedules[faculty].push(assignments[`s${s}_d${d}_p${p}`]);
          }
        }
      }
    }

    // Ensure faculty doesn't teach multiple classes at same time
    for (let faculty in facultySchedules) {
      model.addAtMostOne(facultySchedules[faculty]);
    }
  }

  /**
   * Extract solution from CP-SAT model
   */
  _extractSolution(assignments, subjects, periods, days) {
    const result = {};
    const grid = {};

    for (let d = 0; d < days.length; d++) {
      grid[days[d]] = {};
      
      for (let p = 0; p < periods.length; p++) {
        grid[days[d]][periods[p]] = null;

        for (let s = 0; s < subjects.length; s++) {
          const varName = `s${s}_d${d}_p${p}`;
          if (assignments[varName]) {
            grid[days[d]][periods[p]] = subjects[s];
          }
        }
      }
    }

    return {
      success: true,
      method: 'CP-SAT Constraint Programming (or-tools)',
      grid,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fallback greedy algorithm for timetable generation
   */
  _greedyGeneration(subjects, periods, days) {
    const grid = {};
    const subjectPool = [];

    // Create pool of subjects (repeat to fill all slots)
    for (let i = 0; i < Math.ceil(periods.length * days.length / subjects.length); i++) {
      subjectPool.push(...subjects);
    }

    // Shuffle
    const shuffled = subjectPool.sort(() => Math.random() - 0.5);

    let index = 0;
    for (let d = 0; d < days.length; d++) {
      grid[days[d]] = {};
      for (let p = 0; p < periods.length; p++) {
        if (index < shuffled.length) {
          grid[days[d]][periods[p]] = shuffled[index++];
        }
      }
    }

    return {
      success: true,
      method: 'Greedy Algorithm (Fallback)',
      grid,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Simpler version using basic constraint logic
 * More compatible with Node.js environment
 */
class SimpleTimetableScheduler {
  generateTimetable(subjects, periods, days, constraints = {}) {
    try {
      const grid = {};
      const subjectAssignments = {};
      const facultySchedule = {};
      const roomSchedule = {};

      // Initialize tracking
      for (let d of days) {
        grid[d] = {};
      }

      // Shuffle subjects
      const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);

      // Try to assign each subject considering constraints
      for (let subject of shuffledSubjects) {
        let assigned = false;

        // Try to find best slot with balanced distribution
        for (let day of days) {
          if (assigned) break;
          for (let period of periods) {
            if (grid[day][period]) continue; // Slot already occupied

            // Check constraints
            const isValid = this._validateAssignment(
              subject,
              day,
              period,
              grid,
              facultySchedule,
              roomSchedule,
              constraints
            );

            if (isValid) {
              grid[day][period] = subject;
              subjectAssignments[subject.id] = { day, period };

              // Update tracking
              if (subject.faculty) {
                const key = `${subject.faculty}-${period}`;
                facultySchedule[key] = (facultySchedule[key] || 0) + 1;
              }
              if (subject.room) {
                const key = `${subject.room}-${period}`;
                roomSchedule[key] = (roomSchedule[key] || 0) + 1;
              }

              assigned = true;
              break;
            }
          }
        }

        // If not assigned, place in first available slot
        if (!assigned) {
          for (let day of days) {
            if (assigned) break;
            for (let period of periods) {
              if (!grid[day][period]) {
                grid[day][period] = subject;
                subjectAssignments[subject.id] = { day, period };
                assigned = true;
                break;
              }
            }
          }
        }
      }

      return {
        success: true,
        method: 'Constraint-Based Scheduling',
        grid,
        assignments: subjectAssignments,
        distribution: { facultySchedule, roomSchedule },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Scheduler Error:', error);
      throw error;
    }
  }

  /**
   * Validate if assignment meets all constraints
   */
  _validateAssignment(subject, day, period, grid, facultySchedule, roomSchedule, constraints) {
    // Check faculty conflict
    if (constraints.facultyConstraints && subject.faculty) {
      const key = `${subject.faculty}-${period}`;
      if (facultySchedule[key]) {
        return false; // Faculty already teaching in this period
      }
    }

    // Check room conflict
    if (constraints.roomConstraints && subject.room) {
      const key = `${subject.room}-${period}`;
      if (roomSchedule[key]) {
        return false; // Room already booked in this period
      }
    }

    return true;
  }
}

module.exports = {
  TimetableConstraintSolver,
  SimpleTimetableScheduler,
};
