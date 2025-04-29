
import { PaddockComment } from '../types';

export const generatePaddockComments = (): PaddockComment[] => {
  return [
    {
      timestamp: "2:15 PM",
      horse: "Gold Search",
      comment: "Looking calm and focused. Coat is gleaming, walking with purpose. Trainer engaged in conversation with jockey. Horse appears fit and ready."
    },
    {
      timestamp: "2:12 PM",
      horse: "Rivalry",
      comment: "Slightly agitated, sweating a bit around the neck. Handler having to maintain firm control. Ears pinned back occasionally."
    },
    {
      timestamp: "2:08 PM",
      horse: "Beer With Ice",
      comment: "Very relaxed demeanor, taking it all in stride. Good muscle definition. Jockey seems confident after inspection."
    },
    {
      timestamp: "2:05 PM",
      horse: "Quebrancho",
      comment: "Walking somewhat stiffly. Appears to be favoring left front slightly. Trainer watching closely. Will monitor for any official scratches."
    },
    {
      timestamp: "2:01 PM",
      horse: "Dancing Noah",
      comment: "Beautiful dappled coat, very alert and responsive. Ears forward, taking in surroundings. Handler reports smooth warmup."
    },
    {
      timestamp: "1:58 PM",
      horse: "More Than Five",
      comment: "Impressive presence in the paddock. Good energy but controlled. Muscling looks excellent, particularly through hindquarters."
    }
  ];
};
