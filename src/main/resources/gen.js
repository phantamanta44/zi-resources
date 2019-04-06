const fs = require('fs');

// #########################
// # START DATA
// #########################

const rawMats = {
  copper: {name: 'Copper'},
  tin: {name: 'Tin'},
  aluminum: {name: 'Aluminum'},
  silver: {name: 'Silver'},
  lead: {name: 'Lead'},
  nickel: {name: 'Nickel'},
  iridium: {name: 'Iridium'}
};
const alloyMats = {
  bronze: {name: 'Bronze'},
  steel: {name: 'Steel'},
  constantan: {name: 'Constantan'},
  electrum: {name: 'Electrum'},
  invar: {name: 'Invar'}
};
const vanillaMats = {
  iron: {name: 'Iron'},
  gold: {name: 'Gold'}
};

const rawForms = {
  ore: {name: 'Ore', block: true}
};
const commonForms = {
  dust: {name: 'Dust'},
  ingot: {name: 'Ingot'},
  nugget: {name: 'Nugget'},
  plate: {name: 'Plate'},
  gear: {name: 'Gear'},
  storage_block: {name: 'Block', block: true}
};
const nonVanillaForms = {
  dust: commonForms.dust, plate: commonForms.plate, gear: commonForms.gear
};

const flatItems = {
  charcoal_dust: {name: 'Charcoal Dust', tags: ['forge:dusts', 'forge:dusts/charcoal']},
  coal_dust: {name: 'Coal Dust', tags: ['forge:dusts', 'forge:dusts/coal']},
  obsidian_dust: {name: 'Obsidian Dust', tags: ['forge:dusts', 'forge:dusts/obsidian']},
  sawdust: {name: 'Sawdust', tags: ['forge:dusts', 'forge:dusts/wood']}
};
const flatBlocks = {
  charcoal_block: {name: 'Charcoal Block', tags: ['forge:storage_blocks', 'forge:storage_blocks/charcoal']}
};

// #########################
// # END DATA
// #########################

const rawBlockForms = {};
for (const [formKey, form] of Object.entries(rawForms)) {
  if (form.block) rawBlockForms[formKey] = form;
}
const commonBlockForms = {};
for (const [formKey, form] of Object.entries(commonForms)) {
  if (form.block) commonBlockForms[formKey] = form;
}

const moddedMats = {...rawMats, ...alloyMats};
const regSets = [
  {forms: rawForms, mats: rawMats, type: 'item'},
  {forms: commonForms, mats: moddedMats, type: 'item'},
  {forms: rawBlockForms, mats: rawMats, type: 'block'},
  {forms: commonBlockForms, mats: moddedMats, type: 'block'},
  {forms: nonVanillaForms, mats: vanillaMats, type: 'item'}
];
for (const regSet of regSets) regSet.typeMany = regSet.type + 's';
const flatSets = [
  {units: flatItems, type: 'item'},
  {units: flatBlocks, type: 'block'}
];
for (const flatSet of flatSets) flatSet.typeMany = flatSet.type + 's';

function stringify(jsonObj) {
  return JSON.stringify(jsonObj, null, 2);
}

async function produceFile(path, contents) {
  return new Promise((res, rej) => {
    fs.mkdir(path.substring(0, path.lastIndexOf('/')), {recursive: true}, err => {
      if (err) {
        rej(err);
      } else {
        fs.writeFile(path, contents, {encoding: 'utf-8'}, err => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      }
    });
  });
}

async function produceJson(path, jsonObj) {
  await produceFile(path, stringify(jsonObj));
}

const tasks = {
  async tags() {
    const tagTypes = {};

    function addTag(type, tag, item) {
      let tagType = tagTypes[type];
      if (!tagType) {
        tagType = {};
        tagTypes[type] = tagType;
      }
      let tagSet = tagType[tag];
      if (!tagSet) {
        tagSet = [];
        tagType[tag] = tagSet;
      }
      tagSet.push(item);
    }

    for (const regSet of regSets) {
      for (const form of Object.keys(regSet.forms)) {
        for (const mat of Object.keys(regSet.mats)) {
          addTag(regSet.typeMany, `forge:${form}s`, `zi_resources:${form}_${mat}`);
          addTag(regSet.typeMany, `forge:${form}s/${mat}`, `zi_resources:${form}_${mat}`);
        }
      }
    }
    for (const flatSet of flatSets) {
      for (const [name, unit] of Object.entries(flatSet.units)) {
        for (const tag of unit.tags) {
          addTag(flatSet.typeMany, tag, `zi_resources:${name}`);
          if (flatSet.type === 'block') {
            addTag('items', tag, `zi_resources:${name}`);
          }
        }
      }
    }

    await Promise.all(
        Object.entries(tagTypes).map(([tagType, tags]) => Promise.all(
            Object.entries(tags).map(async ([tag, values]) => {
              const parts = tag.split(':');
              await produceJson(`data/${parts[0]}/tags/${tagType}/${parts[1]}.json`, {values});
            })
        ))
    );
  },

  async lang() {
    const lang = {"itemGroup.zi_resources:tab_zir": "ZI Resources"};
    for (const regSet of regSets) {
      for (const [formKey, form] of Object.entries(regSet.forms)) {
        for (const [matKey, mat] of Object.entries(regSet.mats)) {
          if (regSet.type !== 'item' || !form.block) {
            lang[`${regSet.type}.zi_resources.${formKey}_${matKey}`] = `${mat.name} ${form.name}`;
          }
        }
      }
    }
    for (const flatSet of flatSets) {
      for (const [name, unit] of Object.entries(flatSet.units)) {
        lang[`${flatSet.type}.zi_resources.${name}`] = unit.name;
      }
    }
    await produceJson('assets/zi_resources/lang/en_us.json', lang);
  },

  async models() {
    await Promise.all([
      ...regSets.map(regSet => Promise.all(
          Object.entries(regSet.forms).map(([formKey, form]) => Promise.all(
              Object.keys(regSet.mats).map(async mat => {
                const modelKey = `${formKey}_${mat}`;
                const path = `${formKey}/${modelKey}`;
                if (regSet.type === 'block') {
                  await produceJson(`assets/zi_resources/models/block/${path}.json`, {
                    parent: 'block/cube_all',
                    textures: {
                      all: `zi_resources:block/${path}`
                    }
                  });
                } else { // item
                  await produceJson(`assets/zi_resources/models/item/${modelKey}.json`, form.block ? {
                    parent: `zi_resources:block/${path}`
                  } : {
                    parent: 'item/generated',
                    textures: {
                      layer0: `zi_resources:item/${path}`
                    }
                  });
                }
              })
          ))
      )),
      ...flatSets.map(flatSet => Promise.all(
          Object.keys(flatSet.units).map(async name => {
            if (flatSet.type === 'block') {
              await produceJson(`assets/zi_resources/models/block/${name}.json`, {
                parent: 'block/cube_all',
                textures: {
                  all: `zi_resources:block/${name}`
                }
              });
              await produceJson(`assets/zi_resources/models/item/${name}.json`, {
                parent: `zi_resources:block/${name}`
              });
            } else { // item
              await produceJson(`assets/zi_resources/models/item/${name}.json`, {
                parent: 'item/generated',
                textures: {
                  layer0: `zi_resources:item/${name}`
                }
              });
            }
          })
      ))
    ]);
  },

  async blockStates() {
    await Promise.all([
      ...regSets.filter(regSet => regSet.type === 'block').map(regSet => Promise.all(
          Object.keys(regSet.forms).map(form => Promise.all(
              Object.keys(regSet.mats).map(async mat => {
                const modelKey = `${form}_${mat}`;
                await produceJson(`assets/zi_resources/blockstates/${modelKey}.json`, {
                  variants: {
                    '': {
                      model: `zi_resources:block/${form}/${modelKey}`
                    }
                  }
                });
              })
          ))
      )),
      ...flatSets.filter(flatSet => flatSet.type === 'block').map(flatSet => Promise.all(
          Object.keys(flatSet.units).map(async name => {
            await produceJson(`assets/zi_resources/blockstates/${name}.json`, {
              variants: {
                '': {
                  model: `zi_resources:block/${name}`
                }
              }
            });
          })
      ))
    ]);
  },

  async recipes() {
    async function mkShaped(path, result, tag, pattern) {
      await produceJson(`data/zi_resources/recipes/${path}.json`, {
        "type": "crafting_shaped",
        pattern,
        "key": {
          "#": {
            "tag": `forge:${tag}`
          }
        },
        "result": {
          "item": `zi_resources:${result}`
        }
      });
    }

    async function mkShapeless(path, result, count, tags) {
      await produceJson(`data/zi_resources/recipes/${path}.json`, {
        "type": "crafting_shapeless",
        "ingredients": tags.map(tag => ({
          tag: `forge:${tag}`
        })),
        "result": {
          "item": `zi_resources:${result}`,
          count
        }
      });
    }

    async function mkSmelting(path, result, tag, xp, prefix = 'zi_resources') {
      const recipe = {
        "type": "smelting",
        "ingredient": {
          "tag": `forge:${tag}`
        },
        "result": `${prefix}:${result}`,
        "cookingtime": 200
      };
      if (xp) recipe.experience = xp;
      await produceJson(`data/zi_resources/recipes/${path}.json`, recipe);
    }

    const square = ['###', '###', '###'];

    await Promise.all([
      ...Object.keys(rawMats).map(mat => mkSmelting(`smelt_ore_${mat}`, `ingot_${mat}`, `ores/${mat}`, 0.7)),
      ...Object.keys(moddedMats).map(mat => Promise.all([
        mkSmelting(`smelt_dust_${mat}`, `ingot_${mat}`, `dusts/${mat}`),
        mkShaped(`reassemble_nuggets_${mat}`, `ingot_${mat}`, `nuggets/${mat}`, square),
        mkShapeless(`disassemble_nuggets_${mat}`, `nugget_${mat}`, 9, [`ingots/${mat}`]),
        mkShaped(`compress_block_${mat}`, `storage_block_${mat}`, `ingots/${mat}`, square),
        mkShapeless(`decompress_block_${mat}`, `ingot_${mat}`, 9, [`storage_blocks/${mat}`]),
        mkShaped(`gear_${mat}`, `gear_${mat}`, `ingots/${mat}`, [' # ', '# #', ' # '])
      ])),
      ...Object.keys(vanillaMats).map(mat => Promise.all([
        mkSmelting(`smelt_dust_${mat}`, `${mat}_ingot`, `dusts/${mat}`, false, 'minecraft'),
        mkShaped(`gear_${mat}`, `gear_${mat}`, `ingots/${mat}`, [' # ', '# #', ' # '])
      ]))
    ]);
  }
};

(async function() {

  await Promise.all(Object.entries(tasks).map(async task => {
    function log(msg) {
      console.log(`${new Date().toISOString()} ${task[0]} -- ${msg}`);
    }

    log('starting');
    await task[1](log);
    log('finished');
  }));

  console.log('all generation finished')

})();
