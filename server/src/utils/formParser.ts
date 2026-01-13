import axios from 'axios';
import * as cheerio from 'cheerio';

interface ParsedField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ParsedForm {
  title: string;
  description: string;
  fields: ParsedField[];
}

/**
 * Parse Google Forms from URL
 * Google Forms have a specific HTML structure we can extract
 */
export async function parseGoogleForm(url: string): Promise<ParsedForm> {
  try {
    // Fetch the Google Form page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract form title
    let title = 'Imported Form';
    const titleElement = $('div[role="heading"]').first();
    if (titleElement.length) {
      title = titleElement.text().trim() || title;
    }
    // Alternative title selectors
    if (title === 'Imported Form') {
      const altTitle = $('title').text().replace(' - Google Forms', '').trim();
      if (altTitle) title = altTitle;
    }

    // Extract form description
    let description = '';
    const descElement = $('div[role="heading"]').eq(1);
    if (descElement.length) {
      description = descElement.text().trim();
    }

    const fields: ParsedField[] = [];
    let fieldIndex = 0;

    // Google Forms uses specific data attributes and classes
    // Method 1: Parse from script data (FB_PUBLIC_LOAD_DATA_)
    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
      const scriptContent = $(script).html() || '';
      if (scriptContent.includes('FB_PUBLIC_LOAD_DATA_')) {
        try {
          // Extract the JSON data from the script
          const match = scriptContent.match(/var FB_PUBLIC_LOAD_DATA_ = (.+?);/s);
          if (match && match[1]) {
            const formData = JSON.parse(match[1]);
            // Parse the nested structure
            const parsedFields = parseGoogleFormData(formData);
            if (parsedFields.length > 0) {
              // Ensure title and description are strings
              const parsedTitle = parsedFields[0]?.formTitle;
              const parsedDesc = parsedFields[0]?.formDescription;
              const finalTitle = typeof parsedTitle === 'string' && parsedTitle.trim() ? parsedTitle.trim() : title;
              const finalDesc = typeof parsedDesc === 'string' ? parsedDesc.trim() : description;

              return {
                title: finalTitle,
                description: finalDesc,
                fields: parsedFields.map((f, idx) => ({
                  id: `field-${idx + 1}`,
                  type: f.type,
                  label: typeof f.label === 'string' ? f.label : `Field ${idx + 1}`,
                  required: Boolean(f.required),
                  placeholder: typeof f.placeholder === 'string' ? f.placeholder : undefined,
                  options: Array.isArray(f.options) ? f.options.filter((o: any) => typeof o === 'string') : undefined,
                })),
              };
            }
          }
        } catch (e) {
          console.log('Could not parse FB_PUBLIC_LOAD_DATA_, trying DOM parsing');
        }
      }
    }

    // Method 2: Parse from DOM structure
    // Google Forms question containers
    const questionContainers = $('[data-params]').toArray();

    for (const container of questionContainers) {
      const $container = $(container);
      const dataParams = $container.attr('data-params');

      if (dataParams) {
        try {
          // Parse the data-params attribute
          const params = JSON.parse(dataParams.replace(/&quot;/g, '"'));
          if (Array.isArray(params) && params.length > 0) {
            const questionData = params[0];
            if (Array.isArray(questionData) && questionData.length >= 2) {
              const label = questionData[1] || `Question ${fieldIndex + 1}`;
              const questionType = questionData[3];
              const required = questionData[4] === 1;

              let fieldType = 'text';
              let options: string[] | undefined;

              // Map Google Form question types to our types
              switch (questionType) {
                case 0: // Short answer
                  fieldType = 'shorttext';
                  break;
                case 1: // Paragraph
                  fieldType = 'longtext';
                  break;
                case 2: // Multiple choice
                  fieldType = 'radio';
                  options = extractOptions(questionData);
                  break;
                case 3: // Checkboxes
                  fieldType = 'checkbox';
                  options = extractOptions(questionData);
                  break;
                case 4: // Dropdown
                  fieldType = 'dropdown';
                  options = extractOptions(questionData);
                  break;
                case 5: // Linear scale
                  fieldType = 'rating';
                  break;
                case 7: // Grid (multiple choice)
                  fieldType = 'radio';
                  break;
                case 9: // Date
                  fieldType = 'date';
                  break;
                case 10: // Time
                  fieldType = 'text';
                  break;
                default:
                  fieldType = 'text';
              }

              fields.push({
                id: `field-${++fieldIndex}`,
                type: fieldType,
                label: label,
                required: required,
                options: options,
              });
            }
          }
        } catch (e) {
          // Skip unparseable data-params
        }
      }
    }

    // Method 3: Fallback - parse visible question elements
    if (fields.length === 0) {
      // Try parsing by question class names
      const questions = $('[role="listitem"]').toArray();

      for (const q of questions) {
        const $q = $(q);

        // Get question label
        let label = '';
        const labelEl = $q.find('[role="heading"]').first();
        if (labelEl.length) {
          label = labelEl.text().trim();
        }

        if (!label) {
          // Try other selectors
          const altLabel = $q.find('span').first().text().trim();
          if (altLabel && altLabel.length < 200) {
            label = altLabel;
          }
        }

        if (!label) continue;

        // Determine field type
        let fieldType = 'text';
        let options: string[] | undefined;

        // Check for input types
        if ($q.find('input[type="text"]').length || $q.find('[contenteditable]').length) {
          const isLong = $q.find('[aria-multiline="true"]').length > 0;
          fieldType = isLong ? 'longtext' : 'shorttext';
        } else if ($q.find('input[type="radio"]').length) {
          fieldType = 'radio';
          options = $q.find('[role="radio"]').map((_, el) => $(el).attr('data-value') || $(el).text().trim()).get().filter(Boolean);
        } else if ($q.find('input[type="checkbox"]').length) {
          fieldType = 'checkbox';
          options = $q.find('[role="checkbox"]').map((_, el) => $(el).attr('data-value') || $(el).text().trim()).get().filter(Boolean);
        } else if ($q.find('select').length || $q.find('[role="listbox"]').length) {
          fieldType = 'dropdown';
          options = $q.find('option, [role="option"]').map((_, el) => $(el).text().trim()).get().filter(Boolean);
        } else if ($q.find('input[type="date"]').length) {
          fieldType = 'date';
        } else if ($q.find('input[type="email"]').length) {
          fieldType = 'email';
        }

        // Check if required
        const required = $q.find('[aria-required="true"]').length > 0 || $q.text().includes('*');

        fields.push({
          id: `field-${++fieldIndex}`,
          type: fieldType,
          label: label,
          required: required,
          options: options && options.length > 0 ? options : undefined,
        });
      }
    }

    return { title, description, fields };
  } catch (error: any) {
    console.error('Error parsing Google Form:', error.message);
    throw new Error(`Failed to parse form: ${error.message}`);
  }
}

/**
 * Parse the FB_PUBLIC_LOAD_DATA_ structure
 */
function parseGoogleFormData(data: any[]): any[] {
  const fields: any[] = [];

  try {
    // The structure is deeply nested
    // data[1][1] contains form info
    const formInfo = data[1];

    // Extract title - ensure it's a string
    let formTitle = 'Imported Form';
    const rawTitle = formInfo?.[8] || formInfo?.[1]?.[0];
    if (typeof rawTitle === 'string' && rawTitle.trim()) {
      formTitle = rawTitle.trim();
    } else if (Array.isArray(rawTitle) && typeof rawTitle[0] === 'string') {
      formTitle = rawTitle[0].trim() || 'Imported Form';
    }

    // Extract description - ensure it's a string
    let formDescription = '';
    const rawDesc = formInfo?.[1]?.[1] || formInfo?.[0];
    if (typeof rawDesc === 'string') {
      formDescription = rawDesc.trim();
    } else if (Array.isArray(rawDesc) && typeof rawDesc[0] === 'string') {
      formDescription = rawDesc[0].trim();
    }

    // data[1][1] contains questions array
    const questions = formInfo?.[1];

    if (Array.isArray(questions)) {
      for (const q of questions) {
        if (!Array.isArray(q) || q.length < 2) continue;

        const label = q[1];
        if (!label || typeof label !== 'string') continue;

        const typeData = q[3];
        let type = 'text';
        let options: string[] | undefined;

        if (Array.isArray(typeData) && typeData.length > 0) {
          const questionType = typeData[0]?.[0];

          switch (questionType) {
            case 0:
              type = 'shorttext';
              break;
            case 1:
              type = 'longtext';
              break;
            case 2:
              type = 'radio';
              options = extractOptionsFromData(typeData);
              break;
            case 3:
              type = 'checkbox';
              options = extractOptionsFromData(typeData);
              break;
            case 4:
              type = 'dropdown';
              options = extractOptionsFromData(typeData);
              break;
            case 5:
              type = 'rating';
              break;
            case 9:
              type = 'date';
              break;
            default:
              type = 'text';
          }
        }

        const required = q[4] === 1;

        fields.push({
          formTitle,
          formDescription,
          label,
          type,
          required,
          options,
        });
      }
    }
  } catch (e) {
    console.error('Error parsing Google Form data structure:', e);
  }

  return fields;
}

function extractOptions(questionData: any[]): string[] | undefined {
  try {
    // Options are typically in questionData[4] or [5]
    const optionsData = questionData[4] || questionData[5];
    if (Array.isArray(optionsData) && optionsData.length > 0) {
      if (Array.isArray(optionsData[0])) {
        return optionsData.map((opt: any[]) => opt[0]).filter(Boolean);
      }
    }
  } catch (e) {
    // Ignore option extraction errors
  }
  return undefined;
}

function extractOptionsFromData(typeData: any[]): string[] | undefined {
  try {
    const optionsArray = typeData[0]?.[1];
    if (Array.isArray(optionsArray)) {
      return optionsArray.map((opt: any[]) => opt[0]).filter(Boolean);
    }
  } catch (e) {
    // Ignore
  }
  return undefined;
}

/**
 * Parse generic HTML form
 */
export async function parseHtmlForm(html: string): Promise<ParsedForm> {
  const $ = cheerio.load(html);
  const fields: ParsedField[] = [];
  let fieldIndex = 0;

  // Extract form title
  const title = $('form').attr('name') || $('h1, h2, h3').first().text().trim() || 'Imported HTML Form';
  const description = $('form').attr('title') || '';

  // Parse input fields
  $('input, select, textarea').each((_, element) => {
    const $el = $(element);
    const tagName = (element as any).name || (element as any).tagName?.toLowerCase() || 'input';
    const type = $el.attr('type') || 'text';
    const name = $el.attr('name') || $el.attr('id') || '';

    // Skip hidden and submit/button inputs
    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset') {
      return;
    }

    // Find label
    let label = '';
    const id = $el.attr('id');
    if (id) {
      const labelEl = $(`label[for="${id}"]`);
      if (labelEl.length) {
        label = labelEl.text().trim();
      }
    }
    if (!label) {
      // Try parent label
      const parentLabel = $el.closest('label');
      if (parentLabel.length) {
        label = parentLabel.text().replace($el.text(), '').trim();
      }
    }
    if (!label) {
      // Use name or placeholder as fallback
      label = $el.attr('placeholder') || name || `Field ${fieldIndex + 1}`;
    }

    // Clean label
    label = label.replace(/\*$/, '').trim();

    // Determine field type
    let fieldType = 'text';
    let options: string[] | undefined;

    if (tagName === 'textarea') {
      fieldType = 'longtext';
    } else if (tagName === 'select') {
      fieldType = 'dropdown';
      options = $el.find('option').map((_, opt) => $(opt).text().trim()).get().filter(Boolean);
    } else if (type === 'email') {
      fieldType = 'email';
    } else if (type === 'tel') {
      fieldType = 'phone';
    } else if (type === 'number') {
      fieldType = 'number';
    } else if (type === 'date') {
      fieldType = 'date';
    } else if (type === 'checkbox') {
      fieldType = 'checkbox';
      // Find all checkboxes with same name
      const sameNameCheckboxes = $(`input[type="checkbox"][name="${name}"]`);
      if (sameNameCheckboxes.length > 1) {
        options = sameNameCheckboxes.map((_, cb) => {
          const cbLabel = $(`label[for="${$(cb).attr('id')}"]`).text().trim();
          return cbLabel || $(cb).attr('value') || '';
        }).get().filter(Boolean);
      }
    } else if (type === 'radio') {
      fieldType = 'radio';
      // Find all radios with same name
      const sameNameRadios = $(`input[type="radio"][name="${name}"]`);
      if (sameNameRadios.length > 1) {
        options = sameNameRadios.map((_, r) => {
          const rLabel = $(`label[for="${$(r).attr('id')}"]`).text().trim();
          return rLabel || $(r).attr('value') || '';
        }).get().filter(Boolean);
      }
    } else if (type === 'file') {
      fieldType = 'file';
    }

    // Check if required
    const required = $el.attr('required') !== undefined || $el.attr('aria-required') === 'true';

    // Avoid duplicates for radio/checkbox groups
    if ((type === 'radio' || type === 'checkbox') && name) {
      const existingField = fields.find(f => f.label === label);
      if (existingField) return;
    }

    fields.push({
      id: `field-${++fieldIndex}`,
      type: fieldType,
      label,
      required,
      placeholder: $el.attr('placeholder'),
      options: options && options.length > 0 ? options : undefined,
    });
  });

  return { title, description, fields };
}

/**
 * Main parser function that detects the form type and parses accordingly
 */
export async function parseFormFromUrl(url: string): Promise<ParsedForm> {
  // Check if it's a Google Form
  if (url.includes('docs.google.com/forms') || url.includes('forms.gle')) {
    return parseGoogleForm(url);
  }

  // For other URLs, fetch HTML and parse
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    return parseHtmlForm(response.data);
  } catch (error: any) {
    throw new Error(`Failed to fetch form: ${error.message}`);
  }
}
