package xyz.phanta.zi.resources

import net.minecraftforge.fml.ModLoadingContext
import net.minecraftforge.fml.common.Mod
import net.minecraftforge.fml.config.ModConfig
import xyz.phanta.libnine.Virtue
import xyz.phanta.libnine.definition.InitializationContext
import xyz.phanta.zi.resources.init.ZirCommonInit

@Mod("zi_resources")
object ZirMod : Virtue() {

    override fun init(context: InitializationContext) {
        ModLoadingContext.get().registerConfig(ModConfig.Type.SERVER, ZirConfig.SPEC)
        context.define(ZirCommonInit)
    }

}
