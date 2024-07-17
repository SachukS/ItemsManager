import os
import yaml
from decouple import config as env

LETTERS_MAPPER = {'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh',
                  'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
                  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
                  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': "'", 'ю': 'ju', 'я': 'ja'}


def translit(text):
    result = ''
    for char in text:
        letter = LETTERS_MAPPER.get(char.lower(), char)
        if char.isupper():
            letter = letter.upper()
        result += letter
    return result


def to_camel_case(sentence):
    words = sentence.split()
    return words[0].lower() + ''.join(word.capitalize() for word in words[1:])


def read_config(file_path):
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)


def generate_css(config, output_path):
    css_content = "/* This file was automatically generated by server/generate_static.py */\n"
    for service in config['services']:
        for key, value in service.items():
            name = translit(key.lower())
            css_content += f".info-{name} " + "{\n" + f"    color: {value['color']};\n" + "}\n"
            css_content += f".bullet.service_{name} " + "{\n" + f"    color: {value['color']};\n" + "}\n"
        css_content += "\n"
    with open(output_path, 'w') as file:
        file.write(css_content)
    print(f"file saved: {output_path}")


def generate_js(config, output_path):
    js_content = "// this file was automatically generated by server/generate_static.py\n"
    services = config['services']
    categories = config['categories']
    aux_filters = config['additionalFilters']
    SERVICES = {}
    SERVICE_TO_NUMBER = {}
    FILTERS = []
    DEFAULT_FILTERS = []
    AUX_FILTERS = []
    for index, service in enumerate(services, start=1):
        for key, value in service.items():
            SERVICES[index] = {
                'name': value['title'],
                'alias': translit(key.lower())
            }
            SERVICE_TO_NUMBER[translit(key).upper()] = index
    js_content += "export const SERVICE_TO_NUMBER = {\n"
    js_content += ",\n".join([f'    "{key}": {value}' for key, value in SERVICE_TO_NUMBER.items()])
    js_content += "\n};\n"

    js_content += f"export const SERVICES = {{\n"
    js_content += "".join([f'    "{key}": {value},\n' for key, value in SERVICES.items()]).rstrip(',')
    js_content += "};\n"

    for key, title in categories.items():
        checker_key = to_camel_case(f"{translit(key)} Checker")
        FILTERS.append(f'    "{checker_key}": {{')
        FILTERS.append(f'        value: "{key}", title: "{title}"')
        FILTERS.append(f'    }},')
        DEFAULT_FILTERS.append(f'    {checker_key}: false,')

    for key, title in aux_filters.items():
        AUX_FILTERS.append(f'    {key}: {str(title).lower()},')
    aux_filters_lines_str = "\n".join(AUX_FILTERS).rstrip(',')

    filter_lines_str = "\n".join(FILTERS).rstrip(',')
    default_filters_lines_str = "\n".join(DEFAULT_FILTERS).rstrip(',')

    js_content += f"export const FILTERS = {{ \n{filter_lines_str}\n}};\n"
    js_content += f"export const defaultFilters = {{  \n{default_filters_lines_str} \n}};\n"
    js_content += f"export const auxFilters = {{  \n{aux_filters_lines_str} \n}};"

    with open(output_path, 'w') as file:
        file.write(js_content)
    print(f"file saved: {output_path}")


cfg = read_config('config.yaml')
print(f'Generating css in {os.getcwd()}...')
generate_css(cfg, os.path.join(env('OUT_PATH', 'shared'), 'generated.css'))
print('Generating js... ')
generate_js(cfg, os.path.join(env('OUT_PATH', 'shared'), 'generated_constants.js'))

print('Static generated successfully!  ')
