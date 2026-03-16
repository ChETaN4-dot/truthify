const fs = require('fs');
const { execSync } = require('child_process');

// 1. Restore
execSync('git checkout screens/ResultsScreen.js');

// 2. update theme via the script we already made
execSync('node updateTheme.js');

// 3. Patch pie chart
let code = fs.readFileSync('screens/ResultsScreen.js', 'utf8');

// The updateTheme script incorrectly added it twice? Or I did?
// Let's replace any instances just in case.
code = code.replace(/export default function ResultsScreen\(\{ route, navigation \}\) \{[\s\S]*?const { analysis, imageUri, compareMode } = route\.params;/m,
`export default function ResultsScreen({ route, navigation }) {
    const { C, isDark, toggleTheme } = useTheme();
    const styles = getStyles(C);

    const { analysis, imageUri, compareMode } = route.params;`
);

// Inject import
if (!code.includes('IngredientsPieChart')) {
  code = code.replace(/import IngredientCard from '\.\.\/components\/IngredientCard';/, 
  "import IngredientCard from '../components/IngredientCard';\nimport IngredientsPieChart from '../components/IngredientsPieChart';");
}

let toReplace = `<View style={styles.miniStats}>
                    <Pill label={\`\${(analysis.redFlagIngredients || []).length} Red Flags\`} color={C.danger} />
                    <Pill label={\`\${(analysis.safeIngredients || []).length} Safe\`} color={C.success} />
                    <Pill label={\`\${(analysis.warningIngredients || []).length} Warnings\`} color={C.warning} />
                </View>`;

code = code.replace(toReplace, `<IngredientsPieChart 
                    safe={(analysis.safeIngredients || []).length} 
                    warning={(analysis.warningIngredients || []).length} 
                    danger={(analysis.redFlagIngredients || []).length} 
                />`);

fs.writeFileSync('screens/ResultsScreen.js', code);
console.log('Done patching ResultsScreen.js');
