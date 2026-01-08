# Custom Jewelry Designer - Requirements Document

## Introduction

A comprehensive custom jewelry design system that allows users to create personalized jewelry pieces through an interactive web interface. The system enables users to select templates, customize individual components (beads, charms, pendants), preview their designs, and place orders that are saved to Strapi CMS with both visual and structural data.

## Glossary

- **Custom_Jewelry_System**: The complete web application for designing custom jewelry
- **Template_Gallery**: Collection of predefined jewelry base designs (necklaces, earrings, bracelets)
- **Component_Library**: Database of customizable elements (beads, charms, pendants, chains)
- **Design_Canvas**: Interactive area where users build and preview their jewelry
- **Preview_Generator**: System that creates visual representation of the final design
- **Order_Management**: System that processes and stores completed designs
- **Strapi_Integration**: Backend CMS connection for data persistence
- **Template_Position**: Specific location on a template where components can be placed
- **Component_Selector**: Interface for choosing beads, charms, or pendants for specific positions
- **Bracelet_Calculator**: System component that calculates bead fit based on wrist circumference and bead diameters
- **Letter_Bead**: Special bead component representing individual letters for custom text (e.g., a-letter, א-letter)
- **Wrist_Circumference**: Measurement input for bracelet sizing, supporting both preset and custom values
- **Bead_Diameter**: Physical dimension property of bead components used for bracelet space calculations
- **Text_Arrangement**: System that converts user text input into positioned letter beads on bracelet templates

## Requirements

### Requirement 1

**User Story:** As a jewelry customer, I want to access a custom jewelry designer, so that I can create personalized jewelry pieces.

#### Acceptance Criteria

1. WHEN a user navigates to the custom jewelry page, THE Custom_Jewelry_System SHALL display a welcome message in the center of the screen
2. THE Custom_Jewelry_System SHALL present a "התחילי עכשיו" (Start Now) button prominently
3. THE Custom_Jewelry_System SHALL use consistent visual styling with the existing sadnaot page design
4. THE Custom_Jewelry_System SHALL display animated sparkle effects similar to the reference page
5. THE Custom_Jewelry_System SHALL be responsive across desktop and mobile devices

### Requirement 2

**User Story:** As a jewelry customer, I want to browse available jewelry templates, so that I can choose a base design for customization.

#### Acceptance Criteria

1. WHEN a user clicks the "התחילי עכשיו" button, THE Template_Gallery SHALL display available jewelry templates
2. THE Template_Gallery SHALL show at least one initial template (bow necklace or bow earrings)
3. THE Template_Gallery SHALL display each template with a clear preview image
4. THE Template_Gallery SHALL allow template selection through click interaction
5. WHERE template data is managed externally, THE Template_Gallery SHALL integrate with Strapi CMS for template retrieval

### Requirement 3

**User Story:** As a jewelry customer, I want to customize individual positions on my chosen template, so that I can personalize my jewelry design.

#### Acceptance Criteria

1. WHEN a user selects a template, THE Design_Canvas SHALL display the template with interactive customization points
2. THE Design_Canvas SHALL highlight clickable Template_Positions when hovered
3. WHEN a Template_Position is clicked, THE Component_Selector SHALL open with relevant options
4. THE Component_Selector SHALL display different component types based on position (beads for chain positions, pendants for charm positions)
5. THE Component_Selector SHALL show components as images without backgrounds for easy integration

### Requirement 4

**User Story:** As a jewelry customer, I want to see a real-time preview of my design, so that I can visualize the final product before ordering.

#### Acceptance Criteria

1. WHEN a user selects components for positions, THE Preview_Generator SHALL update the design visualization immediately
2. THE Preview_Generator SHALL composite selected components onto the template accurately
3. THE Preview_Generator SHALL maintain proper scaling and positioning of all elements
4. THE Preview_Generator SHALL support both SVG and 3D rendering approaches
5. THE Design_Canvas SHALL allow users to modify their selections at any time

### Requirement 5

**User Story:** As a jewelry customer, I want to place an order for my custom design, so that I can receive my personalized jewelry.

#### Acceptance Criteria

1. WHEN a user completes their design, THE Custom_Jewelry_System SHALL provide an order placement interface
2. THE Order_Management SHALL collect customer contact information (name, phone, message)
3. THE Order_Management SHALL generate a preview image of the final design
4. THE Order_Management SHALL save both the preview image and component position data to Strapi
5. THE Order_Management SHALL send order confirmation via Telegram integration similar to the sadnaot page

### Requirement 6

**User Story:** As a system administrator, I want to manage jewelry templates and components through Strapi, so that I can update the available options without code changes.

#### Acceptance Criteria

1. THE Strapi_Integration SHALL provide content types for jewelry templates
2. THE Strapi_Integration SHALL provide content types for jewelry components (beads, charms, pendants)
3. THE Strapi_Integration SHALL support image uploads for all template and component assets
4. THE Strapi_Integration SHALL allow categorization of components by type and position compatibility
5. THE Strapi_Integration SHALL enable easy addition of new templates and components through the admin interface

### Requirement 7

**User Story:** As a jewelry customer, I want the design process to be intuitive and visually appealing, so that I enjoy creating my custom jewelry.

#### Acceptance Criteria

1. THE Custom_Jewelry_System SHALL provide smooth transitions between design steps
2. THE Custom_Jewelry_System SHALL use consistent color scheme and typography with the existing brand
3. THE Custom_Jewelry_System SHALL provide clear visual feedback for all user interactions
4. THE Custom_Jewelry_System SHALL include loading states and progress indicators where appropriate
5. THE Custom_Jewelry_System SHALL handle errors gracefully with user-friendly messages

### Requirement 8

**User Story:** As a jewelry customer, I want to design custom bracelets with specific wrist sizing, so that I can create perfectly fitted personalized bracelets.

#### Acceptance Criteria

1. WHEN a user selects a bracelet template, THE Custom_Jewelry_System SHALL display a wrist circumference input interface
2. THE Custom_Jewelry_System SHALL provide popular wrist size options (16cm, 17cm, 18cm, 19cm, 20cm) for quick selection
3. THE Custom_Jewelry_System SHALL allow manual input of custom wrist circumference measurements
4. THE Custom_Jewelry_System SHALL validate wrist circumference input to be between 12cm and 25cm
5. WHERE a template has isBracelet set to true, THE Custom_Jewelry_System SHALL enable bracelet-specific functionality

### Requirement 9

**User Story:** As a jewelry customer, I want the system to automatically calculate how many beads fit on my bracelet, so that I can see an accurate preview of my design.

#### Acceptance Criteria

1. WHEN a user selects beads for a bracelet, THE Custom_Jewelry_System SHALL calculate the total number of beads that fit based on wrist circumference
2. THE Custom_Jewelry_System SHALL use each bead's diameter property to determine spacing and fit
3. THE Custom_Jewelry_System SHALL account for clasp space (approximately 1.5cm) in the total circumference calculation
4. THE Custom_Jewelry_System SHALL display the calculated number of beads to the user before finalizing selection
5. THE Custom_Jewelry_System SHALL prevent selection of bead combinations that exceed the available bracelet space

### Requirement 10

**User Story:** As a jewelry customer, I want to add personalized text to my bracelet using letter beads, so that I can create meaningful custom messages.

#### Acceptance Criteria

1. WHEN designing a bracelet, THE Custom_Jewelry_System SHALL provide a text input field for custom messages
2. THE Custom_Jewelry_System SHALL support both Hebrew and English letter beads (a-letter, b-letter, א-letter, ב-letter, etc.)
3. WHEN a user enters text, THE Custom_Jewelry_System SHALL automatically select corresponding letter beads from the component library
4. THE Custom_Jewelry_System SHALL arrange letter beads in the center of the bracelet design
5. THE Custom_Jewelry_System SHALL validate that the entered text fits within the available bracelet space considering bead diameters

### Requirement 11

**User Story:** As a system administrator, I want to manage bracelet-specific components and properties through Strapi, so that I can maintain accurate bead sizing and letter bead inventory.

#### Acceptance Criteria

1. THE Strapi_Integration SHALL support a diameter field for all jewelry components to enable bracelet calculations
2. THE Strapi_Integration SHALL support an isBracelet boolean field for jewelry templates (default false)
3. THE Strapi_Integration SHALL allow creation of letter bead components with standardized naming (a-letter, b-letter, א-letter, ב-letter)
4. THE Strapi_Integration SHALL maintain backward compatibility with existing templates and components
5. THE Strapi_Integration SHALL enable easy addition of new letter beads for different languages and fonts