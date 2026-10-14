# Vestor

A simple chrome extension for switching between different tabs.

> [!NOTE]
> Add more notes here about usage and other stuff

## Overall architecture

For now, timeouts are being used as a way to keep track what the user
wants to do. Need to later add something more precise.

```mermaid
flowchart TD
    A["Alt+Q command"] --> B{"Switching session active?"}
    B -->|No| C["Get active window and tab"]
    C --> D["Initialize switching target"]
    B -->|Yes| E["Keep current switching target"]
    D --> F["Advance to next tab in MRU order"]
    E --> F
    F --> G["Activate selected tab immediately"]
    G --> H["Reset timeout"]
    H --> I{"Another command before timeout?"}
    I -->|Yes| F
    I -->|No| J["Commit selected tab to MRU front"]
    J --> K["Clear switching state"]
```

***Other things to keep in mind***;

| Situation | Handling |
| --- | --- |
| New tab created	| Add its ID to the correct window's list. |
| Tab closed |	Remove its ID; if it was the switching target, choose a valid remaining tab. |
| Tab moved to another window	| Remove it from the old window's list and add it to the new one. |
| User switches tabs manually	| Move that tab to the front, unless it is an activation caused by Vestor's current switching session. |
| User switches browser windows	| Start cycling in the newly active window, using that window's MRU list. |