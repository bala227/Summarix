from django.apps import AppConfig


class SummarixConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'summarix'
    
    def ready(self):
        import summarix.signals
