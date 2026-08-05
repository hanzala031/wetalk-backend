type Listener = (tutor: any) => void;

class TutorStore {
  private currentTutor = {
    name: 'John',
    type: 'English Coach',
    voice: 'Warm & Friendly',
    accent: 'American',
    image: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1782211315/4ebc3ff2-bfbe-4a36-87f5-fbabf837a404_tjihlz.png',
  };

  private listeners = new Set<Listener>();

  getTutor() {
    return this.currentTutor;
  }

  setTutor(tutor: any) {
    this.currentTutor = tutor;
    this.listeners.forEach((l) => l(tutor));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const tutorStore = new TutorStore();
