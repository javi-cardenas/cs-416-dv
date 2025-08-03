# Modern Software Development

This project is an interactive narrative visualization designed to illustrate key insights from the 2024 Stack Overflow Developer Survey. The visualization is implemented using D3.js and follows the slideshow narrative structure to guide the audience through a focused story about modern software development trends.

## Overview

The visualization consists of five main scenes:

0. **Project Introduction:** Welcome screen introducing the data story and key questions to be explored.
1. **Programming Language Popularity:** Explores the most widely used programming languages among developers worldwide.
2. **AI Adoption:** Investigates how developers are embracing AI tools in their workflow with overall adoption statistics.
3. **Language-Specific AI Patterns:** Discovers which programming communities are most enthusiastic about AI adoption through detailed breakdowns by language.
4. **Compensation Trends:** Analyzes how experience levels and language choice impact developer earnings through an interactive scatter plot.

## Narrative Visualization Techniques

### 1. Messaging

The primary message of this visualization is to convey the current state of the software development industry through four key lenses: programming language popularity, AI adoption statistics, language-specific AI patterns, and compensation trends. It tells the story of which technologies dominate the field, how modern developers are embracing AI tools across different programming communities, and how experience and language choice impact earnings.

### 2. Narrative Structure

This project follows the **Slideshow** narrative structure:

- **Guided Narrative:** The first four scenes present a progressive story, leading the viewer through key insights about programming language popularity, AI adoption trends, and language-specific patterns.
- **Interactive Exploration:** Each scene allows users to explore further statistics about the dataset. The final scene allows for filtering on the interactive compensation scatter plot.

### 3. Visual Structure

Each scene maintains a consistent visual structure for clarity:

- **Scatter and Bar Charts:** Used to represent data relationships and categorical comparisons effectively.
- **Interactive Tooltips:** Hover interactions provide detailed information about individual data points.
- **Color Encoding:** Strategic use of color to differentiate categories and maintain visual hierarchy.

### 4. Scenes

The visualization is divided into five scenes:

- **Scene 0:** Introduction and overview of the data story.
- **Scene 1:** A bar chart displaying the most popular programming languages among developers.
- **Scene 2:** A bar chart showing overall AI adoption patterns with detailed statistics.
- **Scene 3:** A stacked bar chart revealing AI adoption rates by programming language, sorted by adoption percentage.
- **Scene 4:** An interactive scatter plot showing the relationship between years of experience and annual compensation.

### 5. Annotations

Interactive elements enhance data exploration:

- **Tooltips:** Provide detailed information on hover for all chart elements.
- **Scene Indicators:** Clear navigation showing current progress through the story.

### 6. Parameters

The key parameters include:

- **Current Scene:** Tracks the currently displayed scene.
- **Compensation Filter:** Interactive sliders for exploring programming languages based on survey responses.

### 7. Triggers

User interactions drive changes in the visualization:

- **Next/Previous Buttons:** Navigate between scenes with proper state management.
- **Compensation Filters** Interactive sliders for exploring programming languages based on survey responses.
- **Hover Interactions:** Reveal detailed information through tooltips across all chart types.

## Usage

### Running the Project

1. **Clone the repository:**

   ```sh
   git clone [repository-url]
   cd modern-software-development
   ```

2. **Start a local server:**

   ```sh
   npx live-server
   ```

   Or use Python:

   ```sh
   python -m http.server 8000
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080` (or the port shown by your server)

## Project Structure

```
cs-416-dv/
├── index.html                   # Main HTML file
├── style.css                    # Styling and responsive design
├── data/
│   └── project-dataset/
│       └── data.json            # Processed Stack Overflow survey data
├── src/
│   ├── index.js                 # Main application logic
│   └── components/
│       └── charts.js            # Reusable D3.js chart functions
└── README.md                    # Project documentation
```

## Dependencies

- **D3.js v7:** For creating interactive data visualizations.
- **d3-annotation:** For adding contextual annotations to charts.
- **Modern Browser:** Supports ES6 modules and modern JavaScript features.

## Data Source

The visualization uses data from the **Stack Overflow Developer Survey 2024**, which includes responses from over 65,000 developers worldwide. The dataset covers:

- Developer demographics and experience levels
- Programming language preferences and usage
- Compensation information across different regions
- AI tool adoption and preferences
- Development environment choices

## Key Insights Revealed

1. **Programming Language Popularity:** JavaScript, Python, and TypeScript dominate as the most widely used languages among developers worldwide.

2. **AI Adoption Patterns:** Significant portion of developers are embracing AI tools, with clear distinctions between those actively using AI and those planning to adopt.

3. **Language-Specific AI Trends:** Certain programming communities show higher enthusiasm for AI adoption, with modern languages like Dart and TypeScript leading adoption rates.

4. **Compensation Dynamics:** Clear positive relationship between years of experience and annual compensation, with language choice also impacting earning potential.

## Future Enhancements

- **Additional Data Dimensions:** Incorporate more survey fields like education level, company size, and remote work patterns.
- **Advanced Interactions:** Add filtering capabilities across multiple dimensions simultaneously.
- **Comparative Analysis:** Enable year-over-year comparisons with historical survey data.
- **Export Functionality:** Allow users to export visualizations and insights.

## License

This project is licensed under the MIT License.

## Acknowledgements

- **Stack Overflow:** For providing comprehensive developer survey data.
- **D3.js Community:** For excellent documentation and examples.
- **CS 416 Data Visualization:** Course framework and narrative visualization principles.

---
