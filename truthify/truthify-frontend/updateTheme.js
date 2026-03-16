const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Only process if it imports C
  if (!code.includes('import { C }') && !code.includes('C.') && !code.includes('constants/colors')) return;

  // Replace import
  code = code.replace(/import\s*\{\s*C\s*\}\s*from\s*['"](.*?)constants\/colors['"];?/g, `import { useTheme } from '../theme/ThemeContext';`);

  // Inject hook into component
  // Using generic "export default function Name"
  const componentRegex = /(export\s+default\s+function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{)/;
  if (componentRegex.test(code)) {
    code = code.replace(componentRegex, `$1\n    const { C, isDark, toggleTheme } = useTheme();\n    const styles = getStyles(C);\n`);
  } else {
	// Let's check for const Component = () => {}
    const arrowComponentRegex = /(export\s+const\s+[a-zA-Z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{(?!\s*return\s*\{))/;
    if(arrowComponentRegex.test(code)) {
      code = code.replace(arrowComponentRegex, `$1\n    const { C, isDark, toggleTheme } = useTheme();\n    const styles = getStyles(C);\n`);
    } else {
		// Just inject after the first import or something? Fallback if hook is missed.
	}
  }

  // Rewrite StyleSheet.create
  code = code.replace(/const\s+styles\s*=\s*StyleSheet\.create\s*\(/g, "const getStyles = (C) => StyleSheet.create(");

  // Fix references to 'C' outside the styled scope if there are any, mainly inside styling.
  
  // Custom case: `const SAFE_GRADIENT = C.gradCyan ...` in ScanScreen.js
  code = code.replace(/const SAFE_GRADIENT = .*/, `// moved to render block`);

  fs.writeFileSync(filePath, code);
  console.log('Updated ' + filePath);
}

function walkDirs(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walkDirs(p);
    else if (p.endsWith('.js')) processFile(p);
  });
}

walkDirs('./screens');
walkDirs('./components');
walkDirs('./navigation');

