# Habit Tracker

Mała aplikacja HTML/CSS/JavaScript przygotowana jako poligon do testowania workflow agentów:
implementacji zadań, pull requestów, CI i testów w przeglądarce.

## Uruchomienie

Projekt nie wymaga instalowania zależności. W katalogu projektu uruchom:

```bash
python3 -m http.server 8080
```

Następnie otwórz [http://localhost:8080](http://localhost:8080).

## Obecny zakres

- dodawanie nawyków;
- oznaczanie ich jako wykonane;
- pasek dziennego postępu;
- zapis w `localStorage`;
- responsywny interfejs.

Projekt jest celowo mały. Kolejne funkcje powinny być dodawane jako osobne zadania workflow.
