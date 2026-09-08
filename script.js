if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (!window.location.hash) {
  window.scrollTo(0, 0);
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
  }, { once: true });
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted && !window.location.hash) {
    window.scrollTo(0, 0);
  }
});

const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => observer.observe(item));

const accordionItems = document.querySelectorAll('[data-accordion] .accordion-item');

accordionItems.forEach((item) => {
  const trigger = item.querySelector('.accordion-trigger');
  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    accordionItems.forEach((entry) => {
      entry.classList.remove('is-open');
    });

    if (!isOpen) {
      item.classList.add('is-open');
    }
  });
});

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const questions = [
  {
    text: 'Was möchtest du gerade spüren?',
    placeholder: 'Vielleicht mehr Ruhe ...',
  },
  {
    text: 'Was hat dich bisher gehalten?',
    placeholder: 'Zum Beispiel Überforderung, Druck ...',
  },
  {
    text: 'Wie möchtest du dich nach der Session fühlen?',
    placeholder: 'Ruhiger, klarer, leichter ...',
  },
];

const questionnaire = document.getElementById('questionnaire');
const questionStep = document.getElementById('question-step');
const questionText = document.getElementById('question-text');
const questionAnswer = document.getElementById('question-answer');
const nextButton = document.getElementById('next-question');
const prevButton = document.getElementById('prev-question');
const skipButton = document.getElementById('skip-question');
const bookingForm = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');

if (questionnaire && bookingForm && questionStep && questionText && questionAnswer && nextButton && prevButton && skipButton) {
  let currentIndex = 0;
  const answers = Array(questions.length).fill('');

  const renderQuestion = () => {
    const current = questions[currentIndex];
    questionStep.textContent = `Frage ${currentIndex + 1} von ${questions.length}`;
    questionText.textContent = current.text;
    questionAnswer.placeholder = current.placeholder;
    questionAnswer.value = answers[currentIndex] || '';
    prevButton.hidden = currentIndex === 0;
    nextButton.textContent = currentIndex === questions.length - 1 ? 'Termin anfragen' : 'Weiter';

    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.className = `progress-fill progress-${currentIndex + 1}`;
    }
  };

  const finishQuestionnaire = () => {
    questionnaire.classList.add('is-hidden');
    bookingForm.classList.remove('is-hidden');
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const advanceQuestion = () => {
    answers[currentIndex] = questionAnswer.value.trim();

    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    finishQuestionnaire();
  };

  const skipQuestion = () => {
    answers[currentIndex] = '';

    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    finishQuestionnaire();
  };

  nextButton.addEventListener('click', advanceQuestion);
  skipButton.addEventListener('click', skipQuestion);
  prevButton.addEventListener('click', () => {
    answers[currentIndex] = questionAnswer.value.trim();

    if (currentIndex > 0) {
      currentIndex -= 1;
      renderQuestion();
    }
  });

  questionAnswer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      advanceQuestion();
    }
  });

  renderQuestion();
}

const serviceButton = document.getElementById('service-select');
const serviceDropdown = document.getElementById('service-dropdown');
const serviceInput = document.getElementById('selected-service');
const serviceText = document.querySelector('.service-select-text');
const serviceOptions = document.querySelectorAll('.service-option');
const nameInput = document.querySelector('input[name="name"]');
const phoneInput = document.querySelector('input[name="phone"]');
const emailInput = document.querySelector('input[name="email"]');

const setGermanValidationMessage = (input) => {
  if (!input) {
    return;
  }

  input.addEventListener('invalid', () => {
    if (input.validity.valueMissing) {
      input.setCustomValidity('Bitte fülle dieses Feld aus.');
    } else if (input.name === 'phone' && input.validity.patternMismatch) {
      input.setCustomValidity('Bitte gib eine Telefonnummer mit mindestens 6 Ziffern ein.');
    } else if (input.name === 'email' && (input.validity.typeMismatch || input.validity.patternMismatch)) {
      input.setCustomValidity('Bitte gib eine gültige E-Mail-Adresse mit @-Zeichen ein.');
    } else {
      input.setCustomValidity('');
    }
  });

  input.addEventListener('input', () => {
    input.setCustomValidity('');
  });
};

setGermanValidationMessage(nameInput);
setGermanValidationMessage(phoneInput);
setGermanValidationMessage(emailInput);

if (serviceButton && serviceDropdown && serviceInput && serviceText) {
  const closeDropdown = () => {
    serviceDropdown.hidden = true;
    serviceButton.setAttribute('aria-expanded', 'false');
    serviceButton.parentElement.classList.remove('is-open');
  };

  const toggleDropdown = () => {
    const shouldOpen = serviceDropdown.hidden;
    if (shouldOpen) {
      serviceDropdown.hidden = false;
      serviceButton.setAttribute('aria-expanded', 'true');
      serviceButton.parentElement.classList.add('is-open');
      return;
    }

    closeDropdown();
  };

  serviceButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener('click', (event) => {
    if (!serviceButton.parentElement.contains(event.target)) {
      closeDropdown();
    }
  });

  serviceOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      event.stopPropagation();
      const value = option.dataset.value;
      serviceInput.value = value;
      serviceText.textContent = value;
      serviceOptions.forEach((item) => {
        const active = item === option;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-selected', String(active));
      });
      closeDropdown();
    });
  });
}

if (bookingForm && bookingSuccess) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = bookingForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.textContent = 'Wird gesendet ...';
    button.disabled = true;

    try {
      const apiUrl = window.location.port === '8000'
        ? 'http://localhost:3000/api/appointment'
        : '/api/appointment';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData(bookingForm))),
      });
      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          'Der Terminserver ist nicht erreichbar. Bitte starte den Node.js-Server mit „npm start“.',
        );
      }

      if (!response.ok) {
        throw new Error(result.error || 'Die Terminanfrage konnte nicht gesendet werden.');
      }

      bookingForm.classList.add('is-hidden');
      bookingSuccess.classList.remove('is-hidden');
    } catch (error) {
      button.textContent = originalText;
      button.disabled = false;
      const message = error instanceof TypeError
        ? 'Der Terminserver ist nicht erreichbar. Bitte starte den Node.js-Server mit „npm start“.'
        : error.message;
      window.alert(message);
    }
  });
}
