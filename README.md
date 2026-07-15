# Habit Tracker

Mała aplikacja HTML/CSS/JavaScript przygotowana jako poligon do testowania workflow agentów:
implementacji zadań, pull requestów, CI i testów w przeglądarce.

## Uruchomienie

Projekt nie wymaga instalowania zależności. W katalogu projektu uruchom:

```bash
python3 -m http.server 8080
```

Następnie otwórz [http://localhost:8080](http://localhost:8080).

## Testy

Logikę zmiany lokalnego dnia można uruchomić bez przeglądarki:

```bash
node --test tests/date-utils.test.js
```

Smoke test w Chromium instaluje wymagane zależności, uruchamia lokalny serwer
i kończy go automatycznie po teście. Wymaga Node.js 20+ oraz Pythona 3:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Test dodaje nawyk, oznacza go jako wykonany, sprawdza postęp oraz po odświeżeniu
strony potwierdza zapis w `localStorage`.

## Ręczna weryfikacja resetu dziennego

1. Dodaj nawyk, zaznacz go jako wykonany i odśwież stronę — postęp powinien pozostać.
2. W DevTools → Application → Local Storage zmień wartość `habit-tracker.last-activity-day` na poprzedni dzień (np. `2026-07-14`), a następnie odśwież stronę.
3. Nawyki powinny nadal być na liście, ale ich pola wyboru muszą być odznaczone. Data w localStorage powinna zostać zapisana jako bieżący lokalny dzień w formacie `YYYY-MM-DD`.

## Obecny zakres

- dodawanie nawyków;
- oznaczanie ich jako wykonane;
- pasek dziennego postępu;
- zapis w `localStorage`;
- responsywny interfejs.

Projekt jest celowo mały. Kolejne funkcje powinny być dodawane jako osobne zadania workflow.
