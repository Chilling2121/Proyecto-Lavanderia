import os, re

def fix_currency():
    count = 0
    patterns = [
        (r'\$\{\{', r'{{ config.simbolo_moneda }}{{'),
        (r'\(\$\)', r'({{ config.simbolo_moneda }})'),
        (r'\$0\.00', r'{{ config.simbolo_moneda }}0.00'),
        (r'\$0', r'{{ config.simbolo_moneda }}0'),
        (r'\$ ', r'{{ config.simbolo_moneda }} ')
    ]
    
    for root, dirs, files in os.walk('templates'):
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pat, repl in patterns:
                    content = re.sub(pat, repl, content)
                
                # Special cases where \$ is used directly, like +\${{ -> +{{ config.simbolo_moneda }}{{
                content = content.replace('+$', '+{{ config.simbolo_moneda }}')
                content = content.replace('-$', '-{{ config.simbolo_moneda }}')
                content = content.replace('>$<', '>{{ config.simbolo_moneda }}<')
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    count += 1
                    print(f"Fixed {path}")
                    
    print(f"Total files updated: {count}")

if __name__ == '__main__':
    fix_currency()
