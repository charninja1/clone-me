# CloneMe Design System

This directory contains the shared UI components that make up the CloneMe design system. The components follow Material Design 3 principles and WCAG accessibility guidelines.

## Directory Structure

- `components/ui/`: Contains all UI components
- `components/layout/`: Contains layout components
- `components/index.js`: Exports all components for easy importing

## Usage

Import components from the components directory:

```jsx
import { Button, Card, Input } from '../components';
```

## Component Documentation

### Layout Components

#### `MainLayout`

Main layout component with header, footer, and navigation.

```jsx
<MainLayout>
  <YourPageContent />
</MainLayout>
```

### UI Components

#### `AlertBanner`

Display alert messages with different styles.

```jsx
<AlertBanner 
  type="error" // info, success, warning, error
  title="Optional title"
  message="This is an alert message"
  onClose={() => setVisible(false)}
/>
```

#### `Badge`

Display status indicators or counts.

```jsx
<Badge variant="success">Approved</Badge>
```

Variants: default, primary, success, warning, error

#### `Button`

Multi-purpose button component.

```jsx
<Button 
  variant="primary" // primary, secondary, outline, danger, success, ghost
  size="md" // xs, sm, md, lg
  isLoading={isLoading}
  disabled={disabled}
  onClick={handleClick}
  icon={<IconComponent />}
>
  Button Text
</Button>
```

#### `Card`

Container component with consistent styling.

```jsx
<Card 
  padding="default" // none, sm, default, lg
  shadow="default" // none, default, md, lg
  border={true}
>
  Card content
</Card>
```

#### `Checkbox`

Checkbox input with label and description.

```jsx
<Checkbox
  id="terms"
  checked={checked}
  onChange={handleChange}
  label="Accept terms"
  description="By checking this box you agree to our terms of service"
/>
```

#### `EmailDisplay`

Specialized component for displaying emails with actions.

```jsx
<EmailDisplay
  email={emailContent}
  onCopy={handleCopy}
  onOpenInGmail={handleOpenGmail}
  onDownload={handleDownload}
/>
```

#### `Input`

Text input field with label and validation.

```jsx
<Input
  id="email"
  name="email"
  type="email" // text, email, password, etc.
  label="Email Address"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

#### `Select`

Dropdown selection component.

```jsx
<Select
  id="country"
  name="country"
  label="Country"
  value={country}
  onChange={handleChange}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
  error={errors.country}
/>
```

#### `TextArea`

Multi-line text input.

```jsx
<TextArea
  id="message"
  name="message"
  label="Message"
  rows={4}
  value={message}
  onChange={handleChange}
  error={errors.message}
/>
```