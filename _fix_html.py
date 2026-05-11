import re

filepath = r'c:\Users\Asus\Documents\presentation-ai-driven-development\base.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace speaker-sections with speaker-columns (only the opening tag in speaker slide)
content = content.replace(
    '<div class="speaker-sections">',
    '<div class="speaker-columns">',
    1
)

# Replace the two speaker-section divs with speaker-col 
# First occurrence
content = content.replace(
    '<div class="speaker-section">',
    '<div class="speaker-col">',
    2  # Replace first 2 occurrences
)

# Replace the middle speaker-divider (between sections) with speaker-col-divider
# We need to find the specific one between the two sections
# The pattern is: </div>\r\n          <div class="speaker-divider"></div>\r\n          <div class="speaker-col">
content = content.replace(
    '</div>\r\n          <div class="speaker-divider"></div>\r\n          <div class="speaker-col">',
    '</div>\r\n          <div class="speaker-col-divider"></div>\r\n          <div class="speaker-col">',
    1
)

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Done - HTML updated successfully")
